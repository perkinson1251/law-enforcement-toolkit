export const ftpDmTemplate = {
  traineeTakenEmbed: (
    ftoMention: string,
    guildName: string,
    guildAvatarURL?: string
  ) => {
    return {
      color: 0x8260d2,
      author: {
        name: "Developed by perkinson for SA-ES",
        iconURL: "https://gambit-rp.ru/assets/static/images/logotypeDrag.png",
        url: "https://github.com/perkinson1251",
      },
      title: "Вы были взяты наставником",
      description: `${ftoMention} вас взял в качестве своего напарника. Свяжитесь с вашим новым наставником.`,
      timestamp: new Date().toISOString(),
      footer: {
        text: `Оповещение, ${guildName}`,
      },
      thumbnail: {
        url: guildAvatarURL || "",
      },
    };
  },
};
