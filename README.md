# SWT Smart Washer Tracker

This is Smart Washer Tracker that can tracker your washer machine.

http://swt-mu.appspot.com/

# Simple instructions

1.  Create a [Google Cloud Platform project](https://console.cloud.google.com).

2.  Deploy an Index for Google Cloud Datastore
    
    * Deploy Index:

            gcloud app deploy index.yaml
	* Deleting unused indexes:

            gcloud datastore indexes cleanup index.yaml

	* Updating unused indexes:

            gcloud datastore indexes create index.yaml

3.  Install dependencies using NPM:

    * Using NPM:

            npm install

4.  Start the app using NPM:

    * Using NPM:

            npm start

5.  View the app at [http://localhost:8080](http://localhost:8080).

6.  Stop the app by pressing `Ctrl+C`.

7.  Deploy the app:

        gcloud app deploy

8.  View the deployed app at [https://YOUR_PROJECT_ID.appspot.com](https://YOUR_PROJECT_ID.appspot.com).
