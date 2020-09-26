import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Layout, Menu, Breadcrumb, Dropdown, Button, Row, Col, Divider  } from 'antd';
import  React , { useState, setState, Image } from 'react';
const { Header, Content, Footer } = Layout;
const pairs = [6,8,10,12,15,18,21];
const style = { background: 'transparent', padding: '0 0', marginBottom: '10px', position: 'relative' };
class Home extends React.Component {
  constructor(props){
    super(props); 
    this.state = {
      currentPairs: pairs[0],
      vectorPairBase: [],
      vectorPair: [],
      images: [],
      finalImages: [],
      numberClick: 0,
      theSolution: [],
      selectionClick: -1,
      countSolved: 0,
      hideIndex: [],
      inSelection:[],
      initialView: true
    }     
  }

  componentDidMount() {
    this.changePairs(0);   
  }
  
  validateRandom(rand,vectorPair){
    let matchArr=false;
        for (let i =0; i< vectorPair.length; i++ ){
          if(rand == vectorPair[i]){
            matchArr = true;
          }
      }
      return matchArr;
  }

  setVectorValue(vectorPair){
    while (vectorPair.length < this.state.currentPairs ){
      const rand = (Math.floor(Math.random() * (this.state.currentPairs - 1 + 1)) + 1) - 1 ;
      (vectorPair.length === 0) ?  vectorPair.push(rand) : null;
        if(vectorPair.length > 0){
          if (!this.validateRandom(rand,vectorPair)){
            vectorPair.push(rand);
          }
        }
    }
    return vectorPair;
  }

  putFinalImages(finalImages){
    this.setState ({ finalImages  }) ;
  }
  fetchImages(){
    let vectorPair = [];
    let vectorPairBase = [];
    let images = [];
    let finalImages = [];
    this.setState({
      vectorPair: this.setVectorValue(vectorPair),
      vectorPairBase:  this.setVectorValue(vectorPairBase),
      selectionClick: -1 ,
      finalImages: [],
      countSolved: 0,
      hideIndex: [],
      inSelection: [],
      initialView: true
    });
    const t = this;
    setTimeout( ()=>{
      t.setState({ initialView : false});
    },4000);

    for( let j = 0; j< this.state.currentPairs ; j++){
      fetch('https://picsum.photos/200/300?random='+j).then((r)=>{
        images.push(r.url);
        if(images.length === vectorPairBase.length){
          this.state.images = images;          
          for ( let i = 0; i < this.state.currentPairs * 2 ; i++){
            if(i < vectorPairBase.length ){
              finalImages.push({ id: vectorPairBase[i] , image: this.state.images[vectorPairBase[i]]} );
            }else{
              finalImages.push({ id: vectorPair[i- vectorPairBase.length] , image: this.state.images[vectorPair[ i - vectorPairBase.length]] });
            }
          } 
          this.putFinalImages(finalImages);
        }
      });
    } 
  }

  changePairs(id){
    this.setState ({ currentPairs : pairs[id] });
    this.fetchImages(); 
  }

  selectIImage(index,selection){

    this.state.numberClick = this.state.numberClick + 1;
    if( this.state.numberClick >= 2 ){
      const response = [this.state.selectionClick, selection];
      if(selection === this.state.selectionClick){
        return;
      }

      this.setState({
        numberClick: 0,
        selectionClick: -1,
        inSelection: [this.state.selectionClick, selection]
      });

      let skipMatch = false;
      this.state.theSolution.map((v,k)=>{
        
        let match = false; 
        for(let i =0; i< response.length ; i++ ){
            if(v == response[i]){
              match = true;
            }
        }
        if(!match){
          skipMatch = true;
        }
      });

      if(!skipMatch){

          const hI = [];
          let skipAdd = false;
          this.state.hideIndex.map((v,k)=>{
            (v === this.state.finalImages[selection].id) ? skipAdd = true: null; 
          
            hI.push(v);
          })

        if(!skipAdd){
            hI.push( this.state.finalImages[selection].id);
            this.setState({
              countSolved: this.state.countSolved + 1,
              hideIndex: hI
            });
        }

        if(this.state.countSolved === this.state.vectorPairBase.length-1){
          alert('Congratulations');
          this.fetchImages();
        }
      }
    }else{
      this.setState({selectionClick: selection  });
      const solution = [];
      this.state.finalImages.map((v,k)=>{
         if(v.id === index){
          solution.push(k);
          
         }
      });
      this.setState({theSolution: solution, inSelection: [selection, null] });
    }      
  }
  
  hideObject(selection){
          let skipAdd = false;
          this.state.hideIndex.map((v,k)=>{
            (v === this.state.finalImages[selection].id) ? skipAdd = true: null; 
          })
          
      return skipAdd;
  }

  clicked(selection){
    const sel = this.state.inSelection;
    if(selection == sel[0] || selection == sel[1] ||     this.state.initialView){
      return true;
    }else{
      return false;
    }
  }
  render(){
    const menu = (
      <Menu>
        <Menu.Item>
          {pairs.map((value, index) => {
           return <a onClick={() => this.changePairs(index) } key={index} rel="noopener noreferrer">
           {value} Pairs
         </a>
          })}
        </Menu.Item>
      </Menu>
    );
    return <Layout className="layout">
    <Header>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
        <Menu.Item key="1">Pair Game</Menu.Item>
      </Menu>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
      <Dropdown overlay={menu} placement="bottomLeft" arrow>
      <Button>Size ( {this.state.currentPairs} Pairs) </Button>
      </Dropdown>
      <Button onClick={() => { this.fetchImages() }}> Reset  </Button>
      </Breadcrumb>
        <div className="site-layout-content">
        <Row gutter={16}>
        {this.state.finalImages.map((value, index) => {
           return           <Col className="gutter-row" span={6}>
             <div style={style} onClick={()=> this.selectIImage(value.id, index) }>
               <div style={{width:200, height:300, backgroundColor: 'black'}}>
               { (this.hideObject(index) ) ? <div style={{backgroundColor:'gray', width:200, height:300 }}>  </div> : null }
            { (!this.hideObject(index) && this.clicked(index)) ? <img src={value.image} id={index} /> : null }
               </div>
             </div>
           </Col>       
          })
        }
    </Row>
         </div>
    </Content>
    <Footer style={{ textAlign: 'center' }}> Josue Navarrete</Footer>
  </Layout>
  }
}

export default Home
