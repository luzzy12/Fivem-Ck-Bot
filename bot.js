const { Client, Collection, Intents, WebhookClient, MessageEmbed } = require("discord.js");
const Discord = require("discord.js");
const fetch = require('node-fetch');
const ayarlar = require("./ayarlar.json");
const { readdir } = require("fs");

const client = global.client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_PRESENCES,
    ]
});

var steamapikey = ayarlar.steamapikey;
var channelid = ayarlar.channelid;

var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "qboxproject_07f731"
});

client.on("ready", () => {
	client.user.setStatus("online");
	con.connect(function(err) {
		if (err) throw err;
	});
	console.log(`Hazır.`);
});

client.on('message', async message => {
    var command = message.content.split(' ');
    if (message.author.bot) return;
    if (message.channel.id === channelid) {
        if (message.content.startsWith("!ck")) {
            var discordId = command[1];
            if (!discordId) return message.channel.send("Bir Discord ID girmelisin. (Luzzy System)");

            con.query("SELECT * FROM players WHERE discord = ?", discordId, (err, result) => {
                if (err) {
                    console.error(err);
                    return message.channel.send("Bir hata oluştu, lütfen tekrar deneyin. (Luzzy System)");
                }

                if (result.length > 0) {
                    let prometheus = new Discord.MessageEmbed()
                    .setDescription(`Lütfen CK atılacak Discord ID'yi seçin.\n\n**${result[0].discord}** - >  ${result[0].charinfo.firstname} ${result[0].charinfo.lastname}`)
                    .setColor("RANDOM");

                    const row = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId(`${result[0].discord}`)
                                .setEmoji('🏴')
                                .setLabel(`${result[0].discord}`)
                                .setStyle('SUCCESS')
                        );

                    message.channel.send({ embeds: [prometheus], components: [row] });
                } else {
                    let ckEmbedd = new Discord.MessageEmbed()
                        .setColor("RED")
                        .setDescription("Girilen ID ile bir kullanıcı bulunamadı! Lütfen tekrar deneyiniz. (Luzzy System)");

                    message.channel.send({ embeds: [ckEmbedd] });
                }
            });
        }
    }
});

client.on('interactionCreate', async Interaction => {
	if (!Interaction.isButton()) return;
	if (!Interaction.customId) return;
	console.log(Interaction.customId);

	con.query("SELECT * FROM players WHERE discord = ?", Interaction.customId, (err, result) => {
		let user = result[0];
		let usera = Interaction.user;

		if (user) {
			con.query("DELETE FROM players WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM ak4y_battlepass WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM ak4y_caseopening WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM ak4y_dailyrewards WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM ak4y_playtimeshop WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM codem-hud-data WHERE identifier = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM history WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM playerskins WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM player_outfits WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM player_vehicles WHERE discord = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM stashitems WHERE stash = ?", Interaction.customId, (err, results, fields) => {});
			con.query("DELETE FROM twitter_account WHERE id = ?", Interaction.customId, (err, results, fields) => {});
			Interaction.reply({ content: `Başarılı bir şekilde ck attın!`, ephemeral: true });
			
			let ckEmbedsd = new Discord.MessageEmbed()
			.setColor("RED")
			.setDescription(`${usera.tag} adlı kişi ${Interaction.customId} ID'li kişiye başarıyla CK attı! (Luzzy System)`);
			Interaction.channel.send({ embeds: [ckEmbedsd] });
		} else {
			Interaction.reply({ content: `Girilen ID ile bir kullanıcı bulunamadı! Lütfen tekrar deneyiniz. (Luzzy System)`, ephemeral: true });
			return;
		}
	});
});

client.login(ayarlar.token)
  .then(() => console.log(`Bot ${client.user.username} olarak giriş yaptı!`))
  .catch((err) => console.log(`Bot Giriş yapamadı sebep: ${err}`));
