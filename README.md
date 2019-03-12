# Customizable timer
 
React based graph type timer

## Requirements

node with npm

## Getting Started

- Add each nodes based on your needs
- Active part of the timer has purple boundary
- Nodes are draggable any time
- All the edges are directional

## Node Usage

### Move
- **Hold down to relocate a node**
### Start
- **Click start button to start connected timers**
### Notification
- **Tick Notification sound you want**
- (TODO: allow different types of notificaitons)
### Count Down
- **Type amount of time you want**
- **Pause/Resume is only applicable while timer is running**
- e.g. 100 => 1:40 ; 100:100 => 01:41:40 ; 10:100:100 => 11:41:40
### Count Up
- **Counts up timer**
- **Pause/Resume is only applicable while timer is running**
### Count +
- **This Counter Increments when triggered**
- **Reset number of counts**
### Count -
- **This Counter Decrements when triggered**
- **Stops when current count is zero**
- **Reset will reset to set count**
### TODO List
- **simple TODO List**
- Doesn't do anything special when conncted
### Edge
- **Click starting node and then click ending node**
- Selecting background on end point, will remove the edge
### Delete
- **Remove nodes or edges on click**
### Clear
- **Clears everything on the screen**
