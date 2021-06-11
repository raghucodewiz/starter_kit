pragma solidity ^0.5.0;

contract SocialNetwork {
    string public name;
    uint public postCount = 0;
    mapping(uint=>Post) public posts;

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    event postCreated (
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event tipPostCreated (
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

constructor() public {
        name = "Social Network app";
}


function createPost(string memory _content) public {
    //require
    require(bytes(_content).length > 0,'Your should not be empty');
    //Increment postCount
    postCount++;
    //create the post
    posts[postCount] = Post(postCount,_content,0,msg.sender);
    emit postCreated(postCount,_content,0,msg.sender);
}


function tipPost(uint _id) public payable {

    require(_id > 0 && _id <= postCount,'Id is not valid');
    //Fetch the post
    Post memory _post = posts[_id];
    //Fetch the author
    address payable _author = _post.author;
    //pay author
    address(_author).transfer(msg.value);
    //increment tip
    _post.tipAmount = _post.tipAmount + msg.value;
    //upload the post
    posts[_id] = _post;
    //trigger the event
    emit tipPostCreated(postCount,_post.content,_post.tipAmount,_author);

}

}