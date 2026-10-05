import Phaser from 'phaser';import {PlayScene} from './game/PlayScene';import './styles.css';
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:390,height:844,backgroundColor:'#07111f',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH,width:390,height:844},input:{activePointers:2},scene:[PlayScene],render:{antialias:true,roundPixels:true}});
