const fs = require('fs');

const Discord = require('discord.js');
const YouTube = require('youtube-node');

const config = require('./config.json')

const client = new Discord.Client();
const youTube = new YouTube();

youTube.setKey(config.key);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.tag === client.user.tag) {
        return;
    }
    let tag = false;
    content = msg.content;
    let videoID;
    if (content.startsWith(config.prefix + "tags ")) {
        tag = true;
        content = content.substring(7)
    }
    if (content.startsWith("https://www.youtube.com/watch?v=")) {
        videoID = content.slice(32);
    } else if (content.startsWith("www.youtube.com/watch?v=")) {
        videoID = content.slice(24);
    } else
    if (content.startsWith("youtube.com/watch?v=")) {
        videoID = content.slice(20);
    } else if (content.startsWith("https://youtu.be/")) {
        videoID = content.slice(17);
    } else {
        return;
    }
    if(videoID.endsWith("&t=",14)){
        videoID = videoID.substring(0,11);
    }
    youTube.getById(videoID, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            fs.writeFile('json.json', JSON.stringify(result, null, 2));
            if (result.pageInfo.totalResults === 0) {
                msg.channel.send(":x: Invalid Link! Video not found! :x:");
                return;
            }
            let resultt = result.items[0]
            let title = resultt.snippet.title;
            let channel = resultt.snippet.channelTitle;
            let description = resultt.snippet.description;
            let videoUrl = "https://www.youtube.com/watch?v=" + resultt.id;
            let channelUrl = "https://www.youtube.com/channel/" + resultt.snippet.channelId;
            let thumbnailUrl = resultt.snippet.thumbnails.standard.url;
            let duration = resultt.contentDetails.duration.split("T").join("").split("P").join("");
            let views = resultt.statistics.viewCount;
            let tags = resultt.snippet.tags;
            let likes = resultt.statistics.likeCount;
            let dislikes = resultt.statistics.dislikeCount;
            let comments = resultt.statistics.commentCount;
            if (tag) {
                msg.channel.send(tags);
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle(title)
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setColor(16711680)
                    .setDescription(description)
                    .setFooter("", client.user.avatarURL)
                    .setTimestamp()
                    .setURL(videoUrl)
                    .addField("Channel: ",
                        "[" + channel + "](" + channelUrl + ")", true)
                    .addField("Duration: ", duration, true)
                    .addField("Views: ", views, true)
                    .addField("Likes", likes | "Rating disabled", true)
                    .addField("Dislikes", dislikes | "Rating disabled", true)
                    .addField("Comments", comments | "Comments disabled", true);

                msg.channel.send({
                    embed
                });
            }
        }

    })
});
client.login(config.token);
