import ubinascii as binascii
import network
try:
    import usocket as socket
except:
    import socket
import ussl as ssl


CONTENT = b"""\
HTTP/1.0 200 OK

Hello #%d from MicroPython!
"""


def main(use_stream=True):
    key = None
    cert = None
    
    with open('client.key', 'rb') as f:
        key = f.read()

    with open('client.crt', 'rb') as f:
        cert = f.read()

    sta_if = network.WLAN(network.STA_IF)
    sta_if.active(True)
    sta_if.connect('xxx', 'xxx')

    s = socket.socket()

    # Binding to all interfaces - server will be accessible to other hosts!
    ai = socket.getaddrinfo("0.0.0.0", 443)
    print("Bind address info:", ai)
    addr = ai[0][-1]

    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(5)
    print("Listening, connect your browser to https://<this_host>:443/")
    print(addr)

    counter = 0
    while True:
        res = s.accept()
        client_s = res[0]
        client_addr = res[1]
        print("Client address:", client_addr)
        print("Client socket:", client_s)
        # CPython uses key keyfile/certfile arguments, but MicroPython uses key/cert
        client_s = ssl.wrap_socket(client_s, server_side=True, key=key, cert=cert)
        print(client_s)
        print("Request:")
        if use_stream:
            # Both CPython and MicroPython SSLSocket objects support read() and
            # write() methods.
            # Browsers are prone to terminate SSL connection abruptly if they
            # see unknown certificate, etc. We must continue in such case -
            # next request they issue will likely be more well-behaving and
            # will succeed.
            try:
                req = client_s.readline()
                print(req)
                while True:
                    h = client_s.readline()
                    if h == b"" or h == b"\r\n":
                        break
                    print(h)
                if req:
                    client_s.write(CONTENT % counter)
            except Exception as e:
                print("Exception serving request:", e)
        else:
            print(client_s.recv(4096))
            client_s.send(CONTENT % counter)
        client_s.close()
        counter += 1
        print()


main()