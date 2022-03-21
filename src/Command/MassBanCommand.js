const AbstractCommand = require('./AbstractCommand');
const BanQueue        = require('../Queue/BanQueue.js');

class MassBanCommand extends AbstractCommand {
    get name() {
        return 'massban';
    }
    
    get configuration() {
        return {
            description:     "Banea de manera masiva una lista de id`s o un pastebin de las mismas.",
            fullDescription: "Banea de manera masiva una lista de id`s o un pastebin de las mismas..",
            caseInsensitive: true,
            guildOnly:       true,
            usage:           "<...ids or pastebin url>",
            requirements:    {
                roleNames: ["Raid Manager"]
            }
        };
    }
    
    async run(message, args) {
        const guild = message.channel.guild;
        
        if (args[0].indexOf('http') === 0) {
            let reply = await message.reply("Descargando lista.");
            paste.login(process.env.PASTEBIN_USERNAME, process.env.PASTEBIN_PASSWORD, async (success, data) => {
                await reply.edit("Lista descargada, Añadiendo baneos a la queue");
                
                data.split("\n").filter(x => !isNaN(x)).forEach(x => {
                    if (!this.bot.banQueues[guild.id]) {
                        this.bot.banQueues[guild.id] = new BanQueue(this.bot, guild);
                    }
                    
                    this.bot.banQueues[guild.id].push({id: x});
                });
                
                await reply.edit("Añade baneos a la queue");
            });
            
            return;
        }
        
        let reply = await message.reply("Añade baneos a la queue");
        if (!this.bot.banQueues[guild.id]) {
            this.bot.banQueues[guild.id] = new BanQueue(this.bot, guild);
        }
        
        for (let x of args) {
            this.bot.banQueues[guild.id].push({id: x});
        }
        
        await reply.edit("Bans added to queue.");
    }
}

module.exports = MassBanCommand;