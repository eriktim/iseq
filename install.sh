#!/bin/sh

cp iseq.service /etc/systemd/system
systemctl daemon-reload
systemctl start iseq.service

chown -R :ssl-cert /etc/letsencrypt/archive
chown -R :ssl-cert /etc/letsencrypt/live
chmod 770 /etc/letsencrypt/archive
chmod 770 /etc/letsencrypt/live

# TODO echo "#!/bin/sh\n/bin/systemctl restart iseq.service" | tee /usr/local/bin/iseq-restart
# TODO chmod +x/usr/local/bin/iseq-restart
# TODO echo "erik	ALL=NOPASSWD: /usr/local/bin/iseq-restart" | tee --append /etc/sudoers
