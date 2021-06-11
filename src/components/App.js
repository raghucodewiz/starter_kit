import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';
import Main from './Main'
import SocialNetwork from '../abis/SocialNetwork.json'


class App extends Component {

async componentWillMount() {
  await this.loadWeb3()
  await this.loadBlockchainData()
}



async loadWeb3() {

  if(window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }

}


async loadBlockchainData() {
  const web3 = window.web3

  //Load account 
  const accounts = await web3.eth.getAccounts()
  console.log(accounts)
  this.setState({account: accounts[0]})

   //networkId
   const networkId = await web3.eth.getId()
  //  console.log(networkId)
  //  console.log(SocialNetwork.networks[networkId])

   const networkData = SocialNetwork.networks[networkId]
  //Address
  if(networkData) {
    const socialNetwork = web3.eth.Contract(SocialNetwork.abi,networkData.address)
    // console.log(socialNetwork)
    this.setState({socialNetwork})
    const postCount = await socialNetwork.methods.postCount().call()
    this.setState({postCount})
    // console.log(postCount)

    //Load post
    for(var i =1; i<= postCount; i++) {
      const post = await socialNetwork.methods.posts(i).call()
      this.setState({
        posts:[...this.state.posts,post]
      })
    }
    // console.log({posts:this.state.posts})

    //sort the post by their tip amount

    this.setState({
      posts: this.state.posts.sort((a,b)=> b.tipAmount - a.tipAmount)
    })

    this.setState({loading:false})

  }else {
    console.log('Social Network contract not deployed to detect network')
  }

  


}

createPost(content) {
  this.setState({ loading: true })
  this.state.socialNetwork.methods
    .createPost(content)
    .send({ from: this.state.account })
    .on('transactionHash', function(hash){
       console.log(hash)
     })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber)
      console.log(receipt)
      window.location.reload();
    })
}



tipPost(_id) {
  this.setState({ loading: true })
  this.state.socialNetwork.methods
    .tipPost(_id)
    .send({ from: this.state.account, value: window.web3.utils.toWei('0.1','ether')})
    .on('transactionHash', function(hash){
       console.log(hash)
     })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber)
      console.log(receipt)
      window.location.reload();
    })
}



constructor(props) {
  super(props)
  this.state = {
    account: '',
    socialNetwork: null,
    postCount: 0,
    posts: [],
    loading: true
  }

  this.createPost = this.createPost.bind(this)
  this.tipPost = this.tipPost.bind(this)
 
}


  render() {
    return (
      <div>
        <Navbar account ={this.state.account}/>
        { this.state.loading 
          ? <div id ="loader" className="text-center mt-5"><p>loading.......</p></div>
          :
          <Main 
               posts = {this.state.posts}
               createPost= {this.createPost}
               tipPost = {this.tipPost}
          />
        }
        
     </div>
    );
  }
}

export default App;