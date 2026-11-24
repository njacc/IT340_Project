Needs: 
- Cron running with sudo access

Db_log.sh -> reads MongoDB log 

fe_log.sh -> reads error logs and needs apache access

be_log.sh -> API output and backend api running as a system service

Installation: Open each script for it's respective VM, install the script, test it, and the schedule it 

FE VM: 
1: sudo cp fe_log.sh /usr/local/bin/fe_log.sh

2: sudo chmod 750 /usr/local/bin/fe_log.sh

3: sudo ufw logging on

4: sudo /usr/local/bin/fe_log.sh

5: head /var/log/gpuscout/fe-$(date +%F).log

6: */5 * * * * /usr/local/bin/fe_log.sh

DB VM: 
1: sudo cp db_log.sh /usr/local/bin/db_log.sh

2: sudo chmod 750 /usr/local/bin/db_log.sh

3: sudo ufw logging on

4: sudo /usr/local/bin/db_log.sh

5: head /var/log/gpuscout/fe-$(date +%F).log

*/5 * * * * /usr/local/bin/db_log.sh

BE VM: 
1: sudo cp be_log.sh /usr/local/bin/be_log.sh

2: sudo chmod 750 /usr/local/bin/be_log.sh

3: sudo ufw logging on

4: sudo /usr/local/bin/be_log.sh

5: head /var/log/gpuscout/fe-$(date +%F).log

6: */5 * * * * /usr/local/bin/be_log.sh
