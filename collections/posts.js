Posts = new Meteor.Collection('posts');

Posts.allow({
    update: ownsDocument,
    remove: ownsDocument
});

Posts.deny({
    update: function(userId, post, fieldNames) {
        //may only edit the following two fields
        return(_.without(fieldNames, 'url','title','message','lastModified').length > 0);
    }
});

Posts.deny({
    update: function(userId, doc, fieldNames, modifier) {
        doc.lastModified = +(new Date());
        return false;
    }
});

Meteor.methods({
    post: function(postAttributes) {
        var user = Meteor.user();
        var postWithSameLink = Posts.findOne({url: postAttributes.url});

        //ensure the user is logged in
        if (!user){
            throw new Meteor.Error(401, "You need to login to post new stories");
        };

        //ensure the post has a title
        if (!postAttributes.title) {
            throw new Meteor.Error(422, "Please fill in a headline");
        };

        //ensure unique url 
        if (postAttributes.url && postWithSameLink) {
            throw new Meteor.Error(302, "This link has already been posted", postWithSameLink._id);
        }

        //pickout the whitelisted keys OR grab the fields we are expecting
        var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
            userId: user._id,
            author: user.username,
            message: user.message,
            submitted: new Date().getTime(),
            lastModified: new Date().getTime(),
            commentsCount: 0
        });

        var postId = Posts.insert(post);

        return postId;
    }
});





// Posts.allow({
//     insert: function(userId, doc) {
//         // only allow posting if you are logged in
//         return !! userId;
//     }
// });
