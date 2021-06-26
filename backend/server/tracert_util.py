#!/usr/bin/python3

import socket
import struct
import sys
import subprocess
import io
from contextlib import redirect_stdout
import re
from struct import unpack
from socket import AF_INET, inet_pton

whois_servers = ['whois.arin.net', 'whois.apnic.net',
                 'whois.ripe.net', 'whois.afrinic.net',
                 'whois.lacnic.net']

not_found_messages = ['no entries found', 'no match found', 'no match for']

port = 33434
max_hops = 30


class Node:
    def __init__(self, ip):
        self.ip = ip
        self.AS = -1
        self.country = None
        self.net_name = None

    def __str__(self):
        ans = self.ip
        atr = ''
        if self.net_name:
            atr = self.net_name
        if self.AS:
            if atr:
                atr += ', '
            atr += self.AS
        if self.country:
            if atr:
                atr += ', '
            atr += self.country
        return ans + '\r\n' + atr


def check_one_node(dest_name, ttl, dest_addr, icmp, udp):
    # ans format is IP, ShouldContinue
    with socket.socket(socket.AF_INET, socket.SOCK_RAW, icmp) as recv_socket:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM, udp) as send_socket:
            send_socket.setsockopt(socket.SOL_IP, socket.IP_TTL, ttl)
            recv_socket.settimeout(4)
            recv_socket.bind(("0.0.0.0", port))
            print(f"{ttl}. ", end='')
            send_socket.sendto(b"", (dest_name, port))
            curr_addr = None
            finished = False
            tries = 3
            while not finished and tries > 0:
                try:
                    _, curr_addr = recv_socket.recvfrom(512)
                    finished = True
                    curr_addr = curr_addr[0]
                except socket.error:
                    tries = tries - 1
                    if tries == 0:
                        print('*', end='\r\n'*3)
    if not finished:
        pass
    if curr_addr == dest_addr or ttl > max_hops:
        return curr_addr, False
    return curr_addr, True

