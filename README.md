#Bose SoundTouch

## Installation
Include this project into your project. 
```bash
npm install soundtouch --save
```
Start the server to make use of the HTTP API
```bash
git clone https://github.com/thevassiliou/SoundTouch-NodeJS.git
cd SoundTOuch-NodeJS
npm install
node server.js
```

## Usage
Besides the provisioning of the Soundtouch API to control a soundtouch system ([guide] (https://github.com/Adeptive/SoundTouch-NodeJS/wiki) it offers the function to randomly select an album from a predfined set of albums and store it in a given preset. 

### Using Episode Selector
http://127.0.0.1:5006/auto/episodeSelector/:presetKey?
http://127.0.0.1:5006/auto/getAllEpisodes

### episodeSelector
with '''auto/episodeSelector/:presetKey?''' you can instruct the system to store a randomly selected on a given preset, or #6 if none is given.
The dataset from which the episodes are selected is stored in the '''dataStore/libraryContent.json'''. 

The content of this database can be retrieved via '''auto/getAllEpisodes'''. 

### episodeCollector
The database of episodes can be filled via the episodeCollector. 
You start the episodeCollector vial '''node episodeCollector.js''' The episodeCollector listens on changes on the given device (in collectorSetting.json (example in collectorSettingsExample.json)). EpisodeCollector stores in the database every album that will be started on the device, and that serves as the dataset for '''episodeSelector'''
