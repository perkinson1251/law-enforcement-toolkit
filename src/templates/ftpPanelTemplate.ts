export const ftpPanelTemplate = {
  color: 0x8260d2,
  title: "FIELD TRAINING PROGRAM QUEUE",
  author: {
    name: "Developed by perkinson for SA-ES",
    url: "https://github.com/perkinson1251",
    icon_url: "https://gambit-rp.ru/assets/static/images/logotypeDrag.png",
  },
  description: `Система очереди для стажеров и их наставников. Автокик стажёра из очереди происходит через {{AUTO_REMOVE_TIME}} минут ожидания.\n\nИнструкция:\n**СТАЖЕР** - встать/выйти из очереди, используется стажёрами.\n**ВЗЯТЬ** - взять первого в очереди стажёра, используется FTO.\n**ФТО** - встать/выйти из очереди, используется FTO.`,
  fields: [
    { name: "СТАЖЕРЫ", value: "", inline: true },
    { name: "ПОЛЕВЫЕ ОФИЦЕРЫ", value: "", inline: true },
  ],
  image: {
    url: "https://i.imgur.com/xFw3ZZe.gif",
  },
  footer: {
    text: "Без примеров невозможно ни правильно учить, ни успешно учиться.",
  },
};
