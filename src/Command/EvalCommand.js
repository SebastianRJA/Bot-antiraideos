const util                  = require("util");
const AbstractCommand       = require('./AbstractCommand');
const RaidWebhookSubCommand = require('./SubCommand/RaidWebhookSubCommand');
const owner                 = process.env.OWNER_ID;

class EvalCommand extends AbstractCommand {
    get name() {
        return 'eval';
    }
    
    get configuration() {
        return {
            description:     "Comando Eval, reservado para el dueño del bot",
            fullDescription: "Comando Eval, reservado para el dueño del bot",
            requirements:    {
                userIDs: [owner]
            }
        };
    }
    
    async run(message, args) {
        let content = args.join(' ');
        if (content.indexOf('```') === 0) {
            content = content.substring(3).slice(0, -3);
        }
        
        if (content.indexOf('--hide') === 0) {
            content = content.replace('--hide ', '');
            await this.bot.deleteMessage(message.channel.id, message.id);
        }
        
        if (args.length === 0) {
            return "Invalid input";
        }
        
        message.reply('Ejecutando codigo')
            .then(async msg => {
                let channel = message.channel,
                    server  = channel.guild,
                    author  = message.author;
                
                
                let evaled = '';
                try {
                    evaled = eval(content);
                    if (Array.isArray(evaled) || typeof evaled === 'object') {
                        evaled = util.inspect(evaled)
                    }
                } catch (err) {
                    console.error(err);
                    
                    return await msg.edit('Hay un error! Mira la consola.');
                }
                
                const output = typeof (evaled) === 'string' ? evaled.replace(/`/g, '`' + String.fromCharCode(8203)) : evaled;
                
                await msg.edit({
                    embed: {
                        author:    {
                            name: "Execution Success!"
                        },
                        type:      "rich",
                        timestamp: new Date(),
                        color:     0x2196F3,
                        fields:    [
                            {name: "__Input:__", value: `\`\`\`js\n${content}\n\`\`\``},
                            {name: "__Output:__", value: `\`\`\`js\n${output}\n\`\`\``},
                        ]
                    }
                });
            })
            .catch(error => {
                console.log(error);
                console.log("Actualizacion fallida de los mensajes de la eval");
                message.reply("Error de la eval. Mira los logs.");
            });
    }
}

module.exports = EvalCommand;