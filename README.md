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

		sudo npm install cordova@3.6.3-0.2.13 -g
        sudo npm install ionic@1.2.8 -g
		sudo npm install ios-sim@3.0.0 cordova-lib@4.0.0 -g
        sudo gem update --system && sudo gem install compass
        sudo npm install generator-ionic@0.6.1 -g
        sudo npm update -g yo # make sure yo@1.1.2

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
        grunt platform:add:ios
        grunt build:ios

### Install other utility

		npm install ios-sim cordova-lib -g

### Launch the app

		export NODE_PATH=/usr/local/lib/node_modules
		cd com.arrking.moBay
        grunt platform:add:ios
        grunt build:ios
		open platforms/ios/moBay.xcodeproj 

### Customize SASS
http://learn.ionicframework.com/videos/sass/

        ionic setup sass 
        ionic serve

Then, install the app into your device or simulator.


