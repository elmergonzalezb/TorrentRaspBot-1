const torrent = require('./torrent')
const Fs = require('fs');
const Path = require('path');
const Axios = require('axios');
const shell = require('shelljs')


async function download(ctx) {
    try {
        if (ctx.command.args.length != 2) {
            ctx.reply('ERROR in arguments. Please introduce 2 and only 2 arguments: url and name')
        }
        else {
            var url = ctx.command.args[0]
            var name = ctx.command.args[1]

            ctx.reply('Downloading...')
            await DWNLD(url,name,ctx) //We call the function
            ctx.reply('Downloaded!') //If it is successful, reply 'Downloaded!'
            var filetype = await GetTheFileType(ctx,name) //We see the type of file
            await SendToTRRNT(filetype, ctx,name)
        }
    } catch (error) {
        console.log(error)
        ctx.reply('An error has ocurred. Try again later...')
    }
}



async function DWNLD(url,name,ctx) { // Function to make a GET on any url

    try {
        const path = Path.resolve(__dirname, '/home/pi/TRB/tempDownload', name) //Path  
        const writer = Fs.createWriteStream(path)

        const response = await Axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        })

        response.data.pipe(writer)

        return new Promise((resolve, reject) => { //Promise (async object)
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    } catch (error) {
        console.log(error)
        ctx.reply('An error has ocurred during downloading. See if the url it\'s correct.')
    }
}



async function GetTheFileType(ctx,name) {
    try {
        const { stdout, stderr, code } = await shell.exec('file -b /home/pi/TRB/tempDownload/'+name, { silent: true }, { async: true })

        return new Promise((resolve, reject) => { //Promise (async object)

            resolve(stdout)

        })
    }
    catch (error) {
        console.log(error)
        ctx.reply('An error has ocurred during detecting file type')
    }
}

async function SendToTRRNT(stdout, ctx, name) {
    try {
        var prom;
        if (stdout == ("BitTorrent file" + '\n')) {
            prom = 1;
            ctx.reply("Torrent File detected. Starting Transmission")
            await torrent(ctx,name)
        }else{
            prom = 0;
        }

        return new Promise((resolve,reject) => {
            resolve(prom)
        })


    }
    catch (error) {
        console.log(error)
        ctx.reply('An error has ocurred. Try again later...')
    }
}

module.exports = download