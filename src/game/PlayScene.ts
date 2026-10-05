import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
export class PlayScene extends Phaser.Scene {
 private player!:Phaser.GameObjects.Rectangle; private targetLane=1; private laneX:number[]=[]; private laneLines:Phaser.GameObjects.Rectangle[]=[]; private speed=GAME_CONFIG.worldSpeed; private distance=0; private distanceText!:Phaser.GameObjects.Text; private speedText!:Phaser.GameObjects.Text; private inputCooldown=0; private touchStartX:number|null=null;
 constructor(){super('PlayScene')}
 create(){const {width,height}=this.scale;this.cameras.main.setBackgroundColor(GAME_CONFIG.background);this.laneX=this.getLanePositions(width);this.add.rectangle(width/2,height/2,GAME_CONFIG.roadWidth,height,GAME_CONFIG.road);
  for(let i=0;i<2;i++){const x=(this.laneX[i]+this.laneX[i+1])/2;for(let y=-40;y<height+40;y+=70)this.laneLines.push(this.add.rectangle(x,y,4,38,GAME_CONFIG.laneLine).setDepth(1));}
  this.player=this.add.rectangle(this.laneX[1],height*GAME_CONFIG.playerYRatio,42,58,GAME_CONFIG.player).setDepth(3).setStrokeStyle(3,0xffffff,.9);
  this.distanceText=this.add.text(18,18,'DIST 0m',{fontFamily:'Arial',fontSize:'20px',color:'#fff',fontStyle:'bold'}).setDepth(10);this.speedText=this.add.text(18,46,'SPEED 1.0x',{fontFamily:'Arial',fontSize:'15px',color:'#9fb4ca'}).setDepth(10);
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>this.touchStartX=p.x);this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{if(this.touchStartX===null)return;const dx=p.x-this.touchStartX;this.touchStartX=null;if(Math.abs(dx)>22)this.changeLane(dx>0?1:-1);else this.changeLane(p.x<width/2?-1:1)});
  this.input.keyboard?.on('keydown-LEFT',()=>this.changeLane(-1));this.input.keyboard?.on('keydown-A',()=>this.changeLane(-1));this.input.keyboard?.on('keydown-RIGHT',()=>this.changeLane(1));this.input.keyboard?.on('keydown-D',()=>this.changeLane(1));
 }
 update(_:number,delta:number){const dt=Math.min(delta,50)/1000;this.inputCooldown=Math.max(0,this.inputCooldown-delta);this.speed=Math.min(GAME_CONFIG.maxWorldSpeed,this.speed+GAME_CONFIG.speedRampPerSecond*dt);this.distance+=this.speed*dt/10;for(const line of this.laneLines){line.y+=this.speed*dt;if(line.y>this.scale.height+25)line.y-=Math.ceil((this.scale.height+50)/70)*70}this.distanceText.setText(`DIST ${Math.floor(this.distance)}m`);this.speedText.setText(`SPEED ${(this.speed/GAME_CONFIG.worldSpeed).toFixed(1)}x`)}
 private changeLane(direction:-1|1){if(this.inputCooldown>0)return;const next=Phaser.Math.Clamp(this.targetLane+direction,0,GAME_CONFIG.lanes-1);if(next===this.targetLane)return;this.targetLane=next;this.inputCooldown=GAME_CONFIG.laneInputBufferMs;this.tweens.add({targets:this.player,x:this.laneX[next],duration:GAME_CONFIG.laneTweenMs,ease:'Sine.easeOut'})}
 private getLanePositions(width:number){const left=(width-GAME_CONFIG.roadWidth)/2,laneWidth=GAME_CONFIG.roadWidth/GAME_CONFIG.lanes;return Array.from({length:GAME_CONFIG.lanes},(_,i)=>left+laneWidth*(i+.5))}
}
