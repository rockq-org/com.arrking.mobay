# Mobile Bay

## Project 

* Parent

> Project https://github.com/arrking/musa-hw-doc

* Master repository

> https://github.com/arrking/com.arrking.mobay


## Development Framework - Cordova and jQuery Mobile

### About Cordova

* Offical Site 

http://cordova.apache.org

* Blog for learners 

http://rensanning.iteye.com/category/305123

### Install Cordova 

> precondition : NodeJS v0.10.22, npm v1.3.14, (Mac OS X, xCode for iOS apps)

		npm install cordova@3.6.3-0.2.13 -g

### A sample app for learners

> http://rensanning.iteye.com/blog/2021619

### Get ionic

http://ionicframework.com/getting-started/

## How to contribute to lotus lamp ?

### Get the project 

		git clone git@github.com:arrking/musa-hw-mobile.git

### Install node modules 

		cd com.arrking.mobay
        mkdir {platforms,plugins}
		npm install

### Install cordova plugins

		cd com.arrking.mobay
		python extras/execute.py install-plugins

### Install other utility

		npm install ios-sim cordova-lib -g

### Launch the app

		export NODE_PATH=/usr/local/lib/node_modules
		cd com.arrking.mobay
        ionic platform add ios
		ionic prepare ios && ionic build ios
		open platforms/ios/moBay.xcodeproj 

### Customize SASS
http://learn.ionicframework.com/videos/sass/

        ionic setup sass 
        ionic serve

Then, install the app into your device or simulator.


