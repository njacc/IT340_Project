Needs: 
- Cron running with sudo access

Db_log.sh -> reads MongoDB log 
fe_log.sh -> reads error logs and needs apache access
be_log.sh -> API output and backend api running as a system service

Installation: Open each script for it's respective VM, install the script, test it, and the schedule it 

FE VM: 
sudo cp fe_log.sh /usr/local/bin/fe_log.sh
sudo chmod 750 /usr/local/bin/fe_log.sh
sudo ufw logging on
sudo /usr/local/bin/fe_log.sh
head /var/log/gpuscout/fe-$(date +%F).log
*/5 * * * * /usr/local/bin/fe_log.sh

DB VM: 
sudo cp db_log.sh /usr/local/bin/db_log.sh
sudo chmod 750 /usr/local/bin/db_log.sh
sudo ufw logging on
sudo /usr/local/bin/db_log.sh
head /var/log/gpuscout/fe-$(date +%F).log
*/5 * * * * /usr/local/bin/db_log.sh

BE VM: 
sudo cp be_log.sh /usr/local/bin/be_log.sh
sudo chmod 750 /usr/local/bin/be_log.sh
sudo ufw logging on
sudo /usr/local/bin/be_log.sh
head /var/log/gpuscout/fe-$(date +%F).log
*/5 * * * * /usr/local/bin/be_log.sh
