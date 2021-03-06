import Promise from 'bluebird';
import AWS from 'aws-sdk';
const dynamoConfig = {
  sessionToken:    process.env.AWS_SESSION_TOKEN,
  region:          process.env.AWS_REGION
};
const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const stage = process.env.SERVERLESS_STAGE;
const projectName = process.env.SERVERLESS_PROJECT;
const postsTable = projectName + '-posts-' + stage;
const authorsTable = projectName + '-authors-' + stage;
const commentsTable = projectName + '-comments-' + stage;

export function createPost(post) {
  return new Promise(function(resolve, reject) {
    var params = {
      TableName: postsTable,
      Item: post
    };

    docClient.put(params, function(err, data) {
      if (err) return reject(err);
      return resolve(post);
    });

  });
}

export function createComment(comment) {
  return new Promise(function(resolve, reject) {
    var params = {
      TableName: commentsTable,
      Item: comment
    };

    docClient.get({
      TableName: postsTable,
      Key: {
        id: comment.postId
      },
      AttributesToGet: [ "id" ]
    }, function(err, data) {
      if (err) return reject(err);
      if(!data.Item) return reject(new Error(`Post with id: ${comment.postId} does not exist`));

      docClient.put(params, function(err, data) {
        if (err) return reject(err);
        return resolve(comment);
      });
    })
  });
}

export function getPosts() {
  return new Promise(function(resolve, reject) {
    var params = {
      TableName: postsTable,
      AttributesToGet: [
        'id',
        'title',
        'author',
        'bodyContent'
      ]
    };

    docClient.scan(params, function(err, data) {
      if (err) return reject(err);
      return resolve(data["Items"]);
    });

  });
}

export function getAuthor(id) {
  return new Promise(function(resolve, reject) {
    var params = {
      TableName: authorsTable,
      Key: {
        id: id
      },
      AttributesToGet: [
        'id',
        'name'
      ]
    };

    docClient.get(params, function(err, data) {
      if (err) return reject(err);
      return resolve(data["Item"]);
    });

  });
}

export function getAuthors() {
  return new Promise(function(resolve, reject) {
    var params = {
      TableName: authorsTable,
      AttributesToGet: [
        'id',
        'name'
      ]
    };

    docClient.scan(params, function(err, data) {
      if (err) return reject(err);
      return resolve(data["Items"]);
    });

  });
}

export function getComments(postId) {
  return new Promise(function(resolve, reject) {
    var params = {
      TableName: commentsTable,
      FilterExpression : 'postId = :postId',
      ExpressionAttributeValues : {
        ':postId' : postId
      }
    };

    docClient.scan(params, function(err, data) {
      if (err) return reject(err);
      return resolve(data["Items"]);
    });

  });
}
