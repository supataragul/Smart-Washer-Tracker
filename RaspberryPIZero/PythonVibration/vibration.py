import sys
import time
import logging
import threading
import RPi.GPIO as GPIO
import requests
import json
import tweepy
from time import localtime, strftime
import urllib

from ConfigParser import SafeConfigParser

def getserial():
  # Extract serial from cpuinfo file
  cpuserial = "0000000000000000"
  try:
    f = open('/proc/cpuinfo','r')
    for line in f:
      if line[0:6]=='Serial':
        cpuserial = line[10:26]
    f.close()
  except:
    cpuserial = "ERROR000000000"
 
  return cpuserial

def washer_sent(msg):
    try:
        api_url = "https://swt-mu.appspot.com/trackerApi"
        data = {'tracker_id': getserial(), 'running_status': msg}
        r = requests.post(api_url, data=data)
    except (KeyboardInterrupt, SystemExit):
        raise
    except:
        pass

def send_alert(message):
    if len(message) > 1:
        logging.info(message)
        if len(user_key) > 0:
            washer_sent(message)

def send_appliance_active_message():
    send_alert(start_message)
    global appliance_active
    appliance_active = True   

def send_appliance_inactive_message():
    send_alert(end_message)
    global appliance_active
    appliance_active = False    

def vibrated(x):
    global vibrating
    global last_vibration_time
    global start_vibration_time
    logging.debug('Vibrated')
    last_vibration_time = time.time()
    if not vibrating:
        start_vibration_time = last_vibration_time
        vibrating = True

def heartbeat():
    current_time = time.time()
    logging.debug("HB at {}".format(current_time))
    global vibrating
    delta_vibration = last_vibration_time - start_vibration_time
    if (vibrating and delta_vibration > begin_seconds
            and not appliance_active):
        send_appliance_active_message()
    if (not vibrating and appliance_active
            and current_time - last_vibration_time > end_seconds):
        send_appliance_inactive_message()
    vibrating = current_time - last_vibration_time < 2
    threading.Timer(1, heartbeat).start()


logging.basicConfig(format='%(message)s', level=logging.INFO)

if len(sys.argv) == 1:
    logging.critical("No config file specified")
    sys.exit(1)

vibrating = False
appliance_active = False
last_vibration_time = time.time()
start_vibration_time = last_vibration_time

config = SafeConfigParser()
config.read(sys.argv[1])
verbose = config.getboolean('main', 'VERBOSE')
sensor_pin = config.getint('main', 'SENSOR_PIN')
begin_seconds = config.getint('main', 'SECONDS_TO_START')
end_seconds = config.getint('main', 'SECONDS_TO_END')
start_message = config.get('main', 'START_MESSAGE')
end_message = config.get('main', 'END_MESSAGE')

user_key = config.get('key_user','trackerApi')

if verbose:
    logging.getLogger().setLevel(logging.DEBUG)

send_alert(config.get('main', 'BOOT_MESSAGE'))

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.add_event_detect(sensor_pin, GPIO.RISING)
GPIO.add_event_callback(sensor_pin, vibrated)

logging.info('Running config file {} monitoring GPIO pin {}'\
      .format(sys.argv[1], str(sensor_pin)))
threading.Timer(1, heartbeat).start()