const SocialNetwork = artifacts.require("./SocialNetwork.sol")


require('chai')
    .use(require('chai-as-promised'))
    .should()


contract('SocialNetwork',([deployer,author,tipper])=>{
   
    let socialNetwork;

    before(async ()=>{
        socialNetwork = await SocialNetwork.deployed();
    });


    describe('deployement',async ()=>{


      it('successfully deployed',async ()=>{
    
        // socialNetwork = await SocialNetwork.deployed();
        const address = await socialNetwork.address

        assert.notEqual(address,0x0);
        assert.notEqual(address,'');
        assert.notEqual(address,null);
        assert.notEqual(address,undefined);
        
      })




      it('has a name',async ()=>{
        const name = await socialNetwork.name();
        assert.equal(name,'Social Network app')
      })










    })


    describe('posts',async () =>{
        let result,postcount;
        before(async ()=>{
            result = await socialNetwork.createPost('This is my first post',{from: author})
            postcount = await socialNetwork.postCount();
        })

        it('create post',async ()=>{

            //SUCCESS
            assert.equal(postcount,1,'post count correct')
            const event1 = result.logs[0].args
            assert.equal(event1.id.toNumber(),postcount.toNumber(),'Id is correct');
            assert.equal(event1.content,'This is my first post','content is correct');
            assert.equal(event1.tipAmount,'0','tip ammont is correct');
            assert.equal(event1.author,author,'author is correct');


            //Failure: the we have to reject
            await socialNetwork.createPost('',{from:author}).should.be.rejected;
        })

        it('list post',async ()=>{
           
            const post = await socialNetwork.posts(postcount);
            
            assert.equal(post.content,'This is my first post','content is correct');
            assert.equal(post.tipAmount,'0','tip ammont is correct');
            assert.equal(post.author,author,'author is correct');
            assert.equal(post.id.toNumber(),postcount.toNumber(),'Id is correct');

        })


        it('allow users to tip posts', async ()=>{
            //Track author balance before tip
            let oldAuthorBalance;
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)


           result = await socialNetwork.tipPost(postcount,{from:tipper,value:web3.utils.toWei('1','ether')});

        //    console.log(result);
           const event = result.logs[0].args

            assert.equal(event.id.toNumber(),postcount.toNumber(),'Id is correct');
            assert.equal(event.content,'This is my first post','content is correct');
            assert.equal(event.tipAmount,'1000000000000000000','tip ammont is correct');
            assert.equal(event.author,author,'author is correct');

            //balance after tip received
            let newAuthorBalance;
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            //tip amount
            let tipAmount;
            tipAmount = web3.utils.toWei('1','ether')
            tipAmount = new web3.utils.BN(tipAmount)

            const expectedBalance = oldAuthorBalance.add(tipAmount)

            assert.equal(expectedBalance.toString(),newAuthorBalance.toString());

            await socialNetwork.tipPost(99,{from:tipper,value:web3.utils.toWei('1','ether')}).should.be.rejected;


        })
    })


})    