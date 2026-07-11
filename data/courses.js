/* ============================================================
   WordWisp — Course data (multi-language, data-driven)

   Add a language later = add another entry to COURSES. The lesson
   engine, study mode, collection and battles all read this one shape.

     course → units → lessons → terms
     w(term, reading, en, emoji, ex, exr, exen, realm, opts)
       term  : the word in the target language (你好 / hola)
       reading: pronunciation aid (pinyin / romaji / "")
       en    : meaning in the learner's language
       emoji : original art (no third-party assets)
       ex    : short example sentence (target language)
       exr   : example reading (pinyin)
       exen  : example translation
       realm : semantic category (light/night/nature/…)  ← drives card color
       opts  : { card:1 collectible, legendary:1 }
   ============================================================ */
(function () {

  // Semantic "realms" replace battle elements — categories of meaning,
  // each with an original color theme. No weakness/energy chart (that was
  // the Pokémon-ish part); realms are purely thematic + collectible flavor.
  const REALMS = {
    light:  { name: 'Light',  icon: '☀️', grad: ['#fff7da', '#ffd76b', '#ff9f1c'] },
    night:  { name: 'Night',  icon: '🌙', grad: ['#e9ecff', '#9aa6ff', '#5b63d6'] },
    nature: { name: 'Nature', icon: '🌿', grad: ['#e6f7e3', '#9be08f', '#3faf55'] },
    water:  { name: 'Water',  icon: '💧', grad: ['#e3f4ff', '#86c8ff', '#2f8fe0'] },
    fire:   { name: 'Fire',   icon: '🔥', grad: ['#ffe9e1', '#ff9d7a', '#ef5a3c'] },
    heart:  { name: 'Heart',  icon: '💗', grad: ['#ffe6f2', '#ff9ccb', '#ef5fa0'] },
    mind:   { name: 'Spirit', icon: '✨', grad: ['#efe6ff', '#c39bff', '#8a5bd6'] },
    earth:  { name: 'Earth',  icon: '⛰️', grad: ['#f3ece1', '#d9b98a', '#a9824f'] },
    time:   { name: 'Time',   icon: '⏳', grad: ['#e7f7f3', '#86e0cf', '#2bb89a'] },
  };

  const w = (term, reading, en, emoji, ex, exr, exen, realm, opts = {}) =>
    ({ term, reading, en, emoji, ex, exr, exen, realm, ...opts });

  const COURSES = {
    /* ============================ MANDARIN ============================ */
    zh: {
      id: 'zh', name: 'Mandarin Chinese', native: '中文', flag: '🇨🇳', region: 'East Asia',
      tts: 'zh-CN', from: 'English', mascot: '🐼', accent: '#0e9594', accentD: '#0b736e',
      lives: { icon: '🏮', name: 'lanterns' },
      rivals: [ // the 12 Chinese zodiac animals, in order
        { id: 'r0', name: 'Shǔ 鼠', av: '🐭' }, { id: 'r1', name: 'Niú 牛', av: '🐮' },
        { id: 'r2', name: 'Hǔ 虎', av: '🐯' }, { id: 'r3', name: 'Tù 兔', av: '🐰' },
        { id: 'r4', name: 'Lóng 龙', av: '🐲' }, { id: 'r5', name: 'Shé 蛇', av: '🐍' },
        { id: 'r6', name: 'Mǎ 马', av: '🐴' }, { id: 'r7', name: 'Yáng 羊', av: '🐑' },
        { id: 'r8', name: 'Hóu 猴', av: '🐵' }, { id: 'r9', name: 'Jī 鸡', av: '🐔' },
        { id: 'r10', name: 'Gǒu 狗', av: '🐶' }, { id: 'r11', name: 'Zhū 猪', av: '🐷' },
      ],
      units: [
        { title: 'Unit 1 · First Words', color: '#0e9594', lessons: [
          { id: 'zh1a', title: 'Greetings', terms: [
            w('你好','nǐ hǎo','hello','👋','你好，老师！','nǐ hǎo, lǎoshī!','Hello, teacher!','heart',{card:1}),
            w('谢谢','xièxie','thank you','🙏','谢谢你。','xièxie nǐ.','Thank you.','heart',{card:1}),
            w('再见','zàijiàn','goodbye','👋','明天再见。','míngtiān zàijiàn.','See you tomorrow.','night'),
            w('请','qǐng','please','🤲','请坐。','qǐng zuò.','Please sit.','heart'),
            w('对不起','duìbuqǐ','sorry','🙇','对不起！','duìbuqǐ!','I am sorry!','heart'),
          ]},
          { id: 'zh1b', title: 'You & Me', terms: [
            w('我','wǒ','I / me','🙋','我是学生。','wǒ shì xuésheng.','I am a student.','heart',{card:1}),
            w('你','nǐ','you','👉','你好吗？','nǐ hǎo ma?','How are you?','heart',{card:1}),
            w('他','tā','he','👦','他是我哥哥。','tā shì wǒ gēge.','He is my older brother.','mind'),
            w('她','tā','she','👧','她很好。','tā hěn hǎo.','She is well.','mind'),
            w('我们','wǒmen','we / us','👨‍👩‍👧','我们是朋友。','wǒmen shì péngyou.','We are friends.','heart'),
          ]},
          { id: 'zh1c', title: 'Yes & No', terms: [
            w('是','shì','to be / yes','✅','我是老师。','wǒ shì lǎoshī.','I am a teacher.','light'),
            w('不','bù','not / no','❌','我不喝茶。','wǒ bù hē chá.','I do not drink tea.','night'),
            w('好','hǎo','good','👍','很好！','hěn hǎo!','Very good!','light',{card:1}),
            w('对','duì','correct','✔️','对，是这样。','duì, shì zhèyàng.','Yes, that is right.','light'),
            w('也','yě','also','➕','我也是。','wǒ yě shì.','Me too.','mind'),
          ]},
        ]},

        { title: 'Unit 2 · Numbers', color: '#1c7ed6', lessons: [
          { id: 'zh2a', title: 'One to Five', terms: [
            w('一','yī','one','1️⃣','一个人','yí ge rén','one person','mind'),
            w('二','èr','two','2️⃣','二月','èr yuè','February','mind'),
            w('三','sān','three','3️⃣','三天','sān tiān','three days','mind'),
            w('四','sì','four','4️⃣','四个','sì ge','four (of them)','mind'),
            w('五','wǔ','five','5️⃣','五点','wǔ diǎn','five o’clock','mind',{card:1}),
          ]},
          { id: 'zh2b', title: 'Six to Ten', terms: [
            w('六','liù','six','6️⃣','六个月','liù ge yuè','six months','mind'),
            w('七','qī','seven','7️⃣','七天','qī tiān','seven days','mind'),
            w('八','bā','eight','8️⃣','八点','bā diǎn','eight o’clock','mind'),
            w('九','jiǔ','nine','9️⃣','九月','jiǔ yuè','September','mind'),
            w('十','shí','ten','🔟','十个','shí ge','ten (of them)','light',{card:1}),
          ]},
          { id: 'zh2c', title: 'Big Numbers', terms: [
            w('百','bǎi','hundred','💯','一百','yì bǎi','one hundred','light',{card:1}),
            w('千','qiān','thousand','🧮','三千','sān qiān','three thousand','light'),
            w('万','wàn','ten thousand','🔢','一万','yí wàn','ten thousand','light'),
            w('两','liǎng','two (of)','✌️','两个人','liǎng ge rén','two people','mind'),
            w('零','líng','zero','⭕','一百零一','yì bǎi líng yī','one hundred and one','night'),
          ]},
        ]},

        { title: 'Unit 3 · Time', color: '#2bb89a', lessons: [
          { id: 'zh3a', title: 'Days', terms: [
            w('今天','jīntiān','today','🌅','今天很晴。','jīntiān hěn qíng.','Today is sunny.','time',{card:1}),
            w('明天','míngtiān','tomorrow','🌄','明天见。','míngtiān jiàn.','See you tomorrow.','time',{card:1}),
            w('昨天','zuótiān','yesterday','🌇','昨天下雨。','zuótiān xià yǔ.','It rained yesterday.','time',{card:1}),
            w('天','tiān','day / sky','🌤️','三天','sān tiān','three days','light'),
            w('现在','xiànzài','now','⏰','现在几点？','xiànzài jǐ diǎn?','What time is it now?','time'),
          ]},
          { id: 'zh3b', title: 'Calendar', terms: [
            w('年','nián','year','📅','新年快乐','xīnnián kuàilè','Happy New Year','time',{card:1}),
            w('月','yuè','month / moon','🌙','几月？','jǐ yuè?','Which month?','night'),
            w('日','rì','day / sun','🌞','生日','shēngrì','birthday','light'),
            w('星期','xīngqī','week','🗓️','星期一','xīngqī yī','Monday','time'),
            w('点','diǎn','o’clock','🕐','八点','bā diǎn','eight o’clock','time'),
          ]},
        ]},

        { title: 'Unit 4 · People & Family', color: '#e8590c', lessons: [
          { id: 'zh4a', title: 'Family', terms: [
            w('妈妈','māma','mom','👩','我妈妈很好。','wǒ māma hěn hǎo.','My mom is great.','heart',{card:1}),
            w('爸爸','bàba','dad','👨','爸爸去上班。','bàba qù shàngbān.','Dad goes to work.','heart',{card:1}),
            w('哥哥','gēge','older brother','🧑','我哥哥很高。','wǒ gēge hěn gāo.','My brother is tall.','heart'),
            w('姐姐','jiějie','older sister','👩','姐姐爱猫。','jiějie ài māo.','Sister loves cats.','heart'),
            w('家','jiā','home / family','🏠','回家','huí jiā','go home','earth',{card:1}),
          ]},
          { id: 'zh4b', title: 'People', terms: [
            w('人','rén','person','🧍','三个人','sān ge rén','three people','mind',{card:1}),
            w('朋友','péngyou','friend','🤝','好朋友','hǎo péngyou','good friend','heart',{card:1}),
            w('老师','lǎoshī','teacher','👩‍🏫','谢谢老师。','xièxie lǎoshī.','Thank you, teacher.','light',{card:1}),
            w('学生','xuésheng','student','🧑‍🎓','我是学生。','wǒ shì xuésheng.','I am a student.','mind'),
            w('名字','míngzi','name','🪪','你叫什么名字？','nǐ jiào shénme míngzi?','What is your name?','mind'),
          ]},
        ]},

        { title: 'Unit 5 · Nature', color: '#37b24d', lessons: [
          { id: 'zh5a', title: 'Sky', terms: [
            w('太阳','tàiyáng','sun','☀️','太阳出来了。','tàiyáng chūlái le.','The sun came out.','light',{card:1}),
            w('月亮','yuèliàng','moon','🌕','月亮很圆。','yuèliàng hěn yuán.','The moon is round.','night',{card:1}),
            w('星星','xīngxing','star','⭐','天上的星星','tiānshàng de xīngxing','stars in the sky','night',{card:1}),
            w('云','yún','cloud','☁️','白云','bái yún','white clouds','water'),
            w('风','fēng','wind','🌬️','风很大。','fēng hěn dà.','The wind is strong.','nature'),
          ]},
          { id: 'zh5b', title: 'Elements', terms: [
            w('水','shuǐ','water','💧','喝水','hē shuǐ','drink water','water',{card:1}),
            w('火','huǒ','fire','🔥','火车','huǒchē','train','fire',{card:1}),
            w('山','shān','mountain','⛰️','爬山','pá shān','climb a mountain','earth',{card:1}),
            w('树','shù','tree','🌳','大树','dà shù','a big tree','nature'),
            w('雨','yǔ','rain','🌧️','下雨了。','xià yǔ le.','It is raining.','water'),
          ]},
          { id: 'zh5c', title: 'Land & Sea', terms: [
            w('花','huā','flower','🌸','花开了。','huā kāi le.','The flowers bloomed.','nature',{card:1}),
            w('海','hǎi','sea','🌊','大海','dà hǎi','the ocean','water',{card:1}),
            w('石头','shítou','stone','🪨','一块石头','yí kuài shítou','a stone','earth'),
            w('土','tǔ','soil / earth','🟫','土地','tǔdì','land','earth'),
            w('草','cǎo','grass','🌱','小草','xiǎo cǎo','little grass','nature'),
          ]},
        ]},

        { title: 'Unit 6 · Animals', color: '#f08c00', lessons: [
          { id: 'zh6a', title: 'Pets', terms: [
            w('猫','māo','cat','🐱','小猫','xiǎo māo','kitten','nature',{card:1}),
            w('狗','gǒu','dog','🐶','小狗','xiǎo gǒu','puppy','nature',{card:1}),
            w('鸟','niǎo','bird','🐦','小鸟飞。','xiǎo niǎo fēi.','The little bird flies.','light'),
            w('鱼','yú','fish','🐟','鱼游水。','yú yóu shuǐ.','The fish swims.','water',{card:1}),
            w('兔子','tùzi','rabbit','🐰','白兔子','bái tùzi','white rabbit','nature'),
          ]},
          { id: 'zh6b', title: 'Wild', terms: [
            w('马','mǎ','horse','🐴','马跑得快。','mǎ pǎo de kuài.','The horse runs fast.','earth',{card:1}),
            w('熊猫','xióngmāo','panda','🐼','大熊猫','dà xióngmāo','giant panda','nature',{card:1}),
            w('老虎','lǎohǔ','tiger','🐯','老虎很强。','lǎohǔ hěn qiáng.','The tiger is strong.','fire',{card:1}),
            w('鸡','jī','chicken','🐔','一只鸡','yì zhī jī','one chicken','light'),
            w('龙','lóng','dragon','🐉','龙年','lóng nián','Year of the Dragon','fire',{card:1,legendary:1}),
          ]},
        ]},

        { title: 'Unit 7 · Food & Drink', color: '#d6336c', lessons: [
          { id: 'zh7a', title: 'Eat & Drink', terms: [
            w('吃','chī','to eat','🍚','吃饭','chī fàn','eat a meal','fire',{card:1}),
            w('喝','hē','to drink','🥤','喝茶','hē chá','drink tea','water',{card:1}),
            w('米饭','mǐfàn','rice','🍚','一碗米饭','yì wǎn mǐfàn','a bowl of rice','earth'),
            w('茶','chá','tea','🍵','绿茶','lǜ chá','green tea','nature',{card:1}),
            w('面包','miànbāo','bread','🍞','吃面包','chī miànbāo','eat bread','earth'),
          ]},
          { id: 'zh7b', title: 'Tasty', terms: [
            w('好吃','hǎochī','tasty','😋','很好吃！','hěn hǎochī!','Very tasty!','heart'),
            w('苹果','píngguǒ','apple','🍎','红苹果','hóng píngguǒ','red apple','nature',{card:1}),
            w('肉','ròu','meat','🍖','牛肉','niúròu','beef','fire'),
            w('菜','cài','dish / vegetable','🥬','做菜','zuò cài','cook food','nature'),
            w('蛋','dàn','egg','🥚','鸡蛋','jīdàn','chicken egg','light'),
          ]},
        ]},

        { title: 'Unit 8 · Verbs', color: '#7048e8', lessons: [
          { id: 'zh8a', title: 'On the Move', terms: [
            w('去','qù','to go','🚶','我去学校。','wǒ qù xuéxiào.','I go to school.','mind',{card:1}),
            w('来','lái','to come','🙌','你来吗？','nǐ lái ma?','Are you coming?','mind'),
            w('走','zǒu','to walk / leave','🚶','一起走。','yìqǐ zǒu.','Let’s go together.','earth'),
            w('跑','pǎo','to run','🏃','跑得快','pǎo de kuài','run fast','fire'),
            w('坐','zuò','to sit','🪑','请坐。','qǐng zuò.','Please sit.','earth'),
          ]},
          { id: 'zh8b', title: 'Mind', terms: [
            w('看','kàn','to look / read','👀','看书','kàn shū','read a book','light',{card:1}),
            w('说','shuō','to speak','💬','说中文','shuō zhōngwén','speak Chinese','mind',{card:1}),
            w('听','tīng','to listen','👂','听音乐','tīng yīnyuè','listen to music','mind'),
            w('想','xiǎng','to want / miss','💭','我想你。','wǒ xiǎng nǐ.','I miss you.','heart'),
            w('知道','zhīdào','to know','💡','我知道。','wǒ zhīdào.','I know.','mind'),
          ]},
          { id: 'zh8c', title: 'Heart Verbs', terms: [
            w('爱','ài','to love','❤️','我爱你。','wǒ ài nǐ.','I love you.','heart',{card:1}),
            w('学','xué','to learn','📚','学中文','xué zhōngwén','learn Chinese','light',{card:1}),
            w('喜欢','xǐhuan','to like','😊','我喜欢猫。','wǒ xǐhuan māo.','I like cats.','heart',{card:1}),
            w('有','yǒu','to have','🫳','我有一本书。','wǒ yǒu yì běn shū.','I have a book.','earth'),
            w('做','zuò','to do / make','🛠️','做作业','zuò zuòyè','do homework','mind'),
          ]},
        ]},

        { title: 'Unit 9 · Colors', color: '#e64980', lessons: [
          { id: 'zh9a', title: 'Bright Colors', terms: [
            w('红','hóng','red','🟥','红色','hóngsè','the color red','fire',{card:1}),
            w('蓝','lán','blue','🟦','蓝天','lántiān','blue sky','water',{card:1}),
            w('绿','lǜ','green','🟩','绿茶','lǜchá','green tea','nature',{card:1}),
            w('黄','huáng','yellow','🟨','黄色','huángsè','the color yellow','light'),
          ]},
          { id: 'zh9b', title: 'Light & Dark', terms: [
            w('白','bái','white','⬜','白色','báisè','the color white','light',{card:1}),
            w('黑','hēi','black','⬛','黑夜','hēiyè','dark night','night',{card:1}),
            w('颜色','yánsè','color','🎨','什么颜色？','shénme yánsè?','What color?','mind'),
          ]},
        ]},

        { title: 'Unit 10 · Describing', color: '#0c8599', lessons: [
          { id: 'zh10a', title: 'Size & Amount', terms: [
            w('大','dà','big','🔵','大山','dà shān','a big mountain','earth',{card:1}),
            w('小','xiǎo','small','🔹','小猫','xiǎo māo','kitten','nature',{card:1}),
            w('多','duō','many','➕','很多人','hěn duō rén','many people','mind'),
            w('少','shǎo','few','➖','很少','hěn shǎo','very few','mind'),
            w('高','gāo','tall / high','📏','他很高。','tā hěn gāo.','He is tall.','earth'),
          ]},
          { id: 'zh10b', title: 'How Things Feel', terms: [
            w('热','rè','hot','🥵','天气很热。','tiānqì hěn rè.','The weather is hot.','fire',{card:1}),
            w('冷','lěng','cold','🥶','今天很冷。','jīntiān hěn lěng.','Today is cold.','water',{card:1}),
            w('新','xīn','new','✨','新书','xīn shū','a new book','mind'),
            w('快','kuài','fast','⚡','快一点！','kuài yìdiǎn!','A bit faster!','light'),
            w('漂亮','piàoliang','pretty','🌷','很漂亮！','hěn piàoliang!','Very pretty!','heart',{card:1}),
          ]},
        ]},
        { title: 'Unit 11 · Places', color: '#5f3dc4', lessons: [
          { id: 'zh11a', title: 'Around Town', terms: [
            w('学校','xuéxiào','school','🏫','我去学校。','wǒ qù xuéxiào.','I go to school.','mind',{card:1}),
            w('城市','chéngshì','city','🏙️','大城市','dà chéngshì','a big city','earth',{card:1}),
            w('商店','shāngdiàn','shop','🛍️','去商店','qù shāngdiàn','go to the shop','earth'),
            w('公园','gōngyuán','park','🏞️','在公园里','zài gōngyuán lǐ','in the park','nature'),
            w('医院','yīyuàn','hospital','🏥','去医院','qù yīyuàn','go to the hospital','heart'),
          ]},
        ]},
        { title: 'Unit 12 · Questions', color: '#c2255c', lessons: [
          { id: 'zh12a', title: 'Asking Things', terms: [
            w('什么','shénme','what','❓','这是什么？','zhè shì shénme?','What is this?','mind',{card:1}),
            w('谁','shéi','who','🙋','他是谁？','tā shì shéi?','Who is he?','mind'),
            w('哪里','nǎlǐ','where','📍','你在哪里？','nǐ zài nǎlǐ?','Where are you?','mind',{card:1}),
            w('为什么','wèishénme','why','🤔','为什么？','wèishénme?','Why?','mind'),
            w('怎么','zěnme','how','💭','怎么说？','zěnme shuō?','How do you say it?','mind'),
          ]},
        ]},
        { title: 'Unit 13 · Body', color: '#e8590c', lessons: [
          { id: 'zh13a', title: 'Head to Hand', terms: [
            w('手','shǒu','hand','✋','我的手','wǒ de shǒu','my hand','heart',{card:1}),
            w('头','tóu','head','🙂','头疼','tóu téng','headache','heart'),
            w('眼睛','yǎnjing','eyes','👀','大眼睛','dà yǎnjing','big eyes','light',{card:1}),
            w('耳朵','ěrduo','ears','👂','小耳朵','xiǎo ěrduo','little ears','heart'),
            w('嘴','zuǐ','mouth','👄','张嘴','zhāng zuǐ','open your mouth','heart'),
          ]},
        ]},
        { title: 'Unit 14 · Clothes', color: '#7048e8', lessons: [
          { id: 'zh14a', title: 'Getting Dressed', terms: [
            w('衣服','yīfu','clothes','👕','新衣服','xīn yīfu','new clothes','earth',{card:1}),
            w('鞋','xié','shoes','👟','一双鞋','yì shuāng xié','a pair of shoes','earth'),
            w('帽子','màozi','hat','🧢','戴帽子','dài màozi','wear a hat','earth',{card:1}),
            w('裤子','kùzi','pants','👖','长裤子','cháng kùzi','long pants','earth'),
            w('穿','chuān','to wear','🧥','穿衣服','chuān yīfu','put on clothes','mind'),
          ]},
        ]},
        { title: 'Unit 15 · Weather', color: '#1c7ed6', lessons: [
          { id: 'zh15a', title: 'How Is It Outside?', terms: [
            w('天气','tiānqì','weather','🌦️','天气很好。','tiānqì hěn hǎo.','The weather is great.','water',{card:1}),
            w('晴','qíng','sunny','☀️','今天很晴。','jīntiān hěn qíng.','Today is sunny.','light',{card:1}),
            w('雪','xuě','snow','❄️','下雪了。','xià xuě le.','It is snowing.','water',{card:1}),
            w('阴','yīn','overcast','☁️','天阴了。','tiān yīn le.','It clouded over.','night'),
            w('刮风','guā fēng','windy','🌬️','外面刮风。','wàimiàn guā fēng.','It is windy outside.','nature'),
          ]},
        ]},
        { title: 'Unit 16 · Feelings', color: '#d6336c', lessons: [
          { id: 'zh16a', title: 'How Do You Feel?', terms: [
            w('高兴','gāoxìng','happy','😊','我很高兴。','wǒ hěn gāoxìng.','I am happy.','heart',{card:1}),
            w('累','lèi','tired','😩','我累了。','wǒ lèi le.','I am tired.','night'),
            w('饿','è','hungry','😋','我饿了。','wǒ è le.','I am hungry.','fire',{card:1}),
            w('渴','kě','thirsty','🥤','我渴了。','wǒ kě le.','I am thirsty.','water'),
            w('忙','máng','busy','⏰','你忙吗？','nǐ máng ma?','Are you busy?','mind'),
          ]},
        ]},
        { title: 'Unit 17 · At School', color: '#0c8599', lessons: [
          { id: 'zh17a', title: 'On the Desk', terms: [
            w('书','shū','book','📖','看书','kàn shū','read a book','mind',{card:1}),
            w('笔','bǐ','pen','🖊️','一支笔','yì zhī bǐ','a pen','mind'),
            w('桌子','zhuōzi','desk','🪑','在桌子上','zài zhuōzi shàng','on the desk','earth'),
            w('椅子','yǐzi','chair','💺','坐在椅子上','zuò zài yǐzi shàng','sit on the chair','earth'),
            w('电脑','diànnǎo','computer','💻','用电脑','yòng diànnǎo','use a computer','mind',{card:1}),
          ]},
        ]},
        { title: 'Unit 18 · Transport', color: '#1c7ed6', lessons: [
          { id: 'zh18a', title: 'Getting Around', terms: [
            w('车','chē','car','🚗','开车','kāi chē','drive a car','earth',{card:1}),
            w('火车','huǒchē','train','🚆','坐火车','zuò huǒchē','take the train','fire',{card:1}),
            w('飞机','fēijī','airplane','✈️','坐飞机','zuò fēijī','take a plane','light',{card:1}),
            w('公共汽车','gōnggòng qìchē','bus','🚌','坐公共汽车','zuò gōnggòng qìchē','take the bus','earth'),
            w('自行车','zìxíngchē','bicycle','🚲','骑自行车','qí zìxíngchē','ride a bike','nature'),
          ]},
        ]},
        { title: 'Unit 19 · Daily Routine', color: '#2bb89a', lessons: [
          { id: 'zh19a', title: 'Through the Day', terms: [
            w('买','mǎi','to buy','🛒','买东西','mǎi dōngxi','buy things','earth',{card:1}),
            w('睡觉','shuìjiào','to sleep','😴','去睡觉','qù shuìjiào','go to sleep','night',{card:1}),
            w('起床','qǐchuáng','to get up','🌅','七点起床','qī diǎn qǐchuáng','get up at seven','time'),
            w('工作','gōngzuò','to work','💼','我在工作。','wǒ zài gōngzuò.','I am working.','mind'),
            w('玩','wán','to play','🎮','出去玩','chūqù wán','go out and play','heart'),
          ]},
        ]},
        { title: 'Unit 20 · Everyday Talk', color: '#7048e8', lessons: [
          { id: 'zh20a', title: 'Reaching Out', terms: [
            w('问','wèn','to ask','❓','问老师','wèn lǎoshī','ask the teacher','mind',{card:1}),
            w('写','xiě','to write','✍️','写汉字','xiě hànzì','write characters','mind',{card:1}),
            w('帮助','bāngzhù','to help','🤝','谢谢你的帮助。','xièxie nǐ de bāngzhù.','Thanks for your help.','heart'),
            w('给','gěi','to give','🎁','给你','gěi nǐ','here you go','heart'),
            w('打电话','dǎ diànhuà','to make a phone call','📞','给我打电话。','gěi wǒ dǎ diànhuà.','Call me.','mind'),
          ]},
        ]},
      ],
    },

    /* ===================== SPANISH (taster) ===================== */
    es: {
      id: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', region: 'Americas',
      tts: 'es-ES', from: 'English', mascot: '🐂', accent: '#e8590c', accentD: '#c84a08',
      lives: { icon: '🌶️', name: 'chiles' },
      rivals: [
        { id: 'r0', name: 'Pepe', av: '🐂' }, { id: 'r1', name: 'Lola', av: '🐓' },
        { id: 'r2', name: 'Rosa', av: '🦙' }, { id: 'r3', name: 'Mateo', av: '🐎' },
        { id: 'r4', name: 'Nina', av: '🐺' }, { id: 'r5', name: 'Diego', av: '🐆' },
        { id: 'r6', name: 'Sol', av: '🦅' }, { id: 'r7', name: 'Rey', av: '🐉' },
      ],
      units: [
        { title: 'Unidad 1 · Saludos', color: '#0e9594', lessons: [
          { id: 'es1a', title: 'Greetings', terms: [
            w('hola','','hello','👋','¡Hola, amigo!','','Hello, friend!','heart',{card:1}),
            w('gracias','','thank you','🙏','Muchas gracias.','','Thank you very much.','heart',{card:1}),
            w('adiós','','goodbye','👋','Adiós, hasta mañana.','','Goodbye, see you tomorrow.','night'),
            w('por favor','','please','🤲','Agua, por favor.','','Water, please.','heart'),
          ]},
          { id: 'es1b', title: 'Yo y Tú', terms: [
            w('yo','','I','🙋','Yo soy estudiante.','','I am a student.','heart',{card:1}),
            w('tú','','you','👉','¿Cómo estás tú?','','How are you?','heart',{card:1}),
            w('sí','','yes','✅','Sí, claro.','','Yes, of course.','light'),
            w('no','','no','❌','No, gracias.','','No, thank you.','night'),
          ]},
        ]},
        { title: 'Unidad 2 · Comida', color: '#1c7ed6', lessons: [
          { id: 'es2a', title: 'Food', terms: [
            w('agua','','water','💧','un vaso de agua','','a glass of water','water',{card:1}),
            w('pan','','bread','🍞','pan fresco','','fresh bread','earth'),
            w('manzana','','apple','🍎','una manzana roja','','a red apple','nature',{card:1}),
            w('gato','','cat','🐱','el gato negro','','the black cat','nature',{card:1}),
          ]},
        ]},
        { title: 'Unidad 3 · Números', color: '#fab005', lessons: [
          { id: 'es3a', title: 'Numbers', terms: [
            w('uno','','one','1️⃣','','','','mind',{card:1}),
            w('dos','','two','2️⃣','','','','mind'),
            w('tres','','three','3️⃣','','','','mind'),
            w('cuatro','','four','4️⃣','','','','mind'),
            w('cinco','','five','5️⃣','','','','mind'),
            w('diez','','ten','🔟','','','','mind',{card:1}),
          ]},
        ]},
        { title: 'Unidad 4 · Colores', color: '#e64980', lessons: [
          { id: 'es4a', title: 'Colors', terms: [
            w('rojo','','red','🟥','el coche rojo','','the red car','fire',{card:1}),
            w('azul','','blue','🟦','el cielo azul','','the blue sky','water',{card:1}),
            w('verde','','green','🟩','la hoja verde','','the green leaf','nature'),
            w('amarillo','','yellow','🟨','el sol amarillo','','the yellow sun','light'),
            w('negro','','black','⬛','el gato negro','','the black cat','night'),
            w('blanco','','white','⬜','la nieve blanca','','the white snow','light'),
          ]},
        ]},
        { title: 'Unidad 5 · Familia', color: '#7048e8', lessons: [
          { id: 'es5a', title: 'Family', terms: [
            w('madre','','mother','👩','mi madre','','my mother','heart',{card:1}),
            w('padre','','father','👨','mi padre','','my father','heart',{card:1}),
            w('hermano','','brother','🧑','mi hermano','','my brother','heart'),
            w('hermana','','sister','👧','mi hermana','','my sister','heart'),
            w('amigo','','friend','🤝','un buen amigo','','a good friend','heart',{card:1}),
          ]},
        ]},
        { title: 'Unidad 6 · Verbos', color: '#0c8599', lessons: [
          { id: 'es6a', title: 'Verbs', terms: [
            w('comer','','to eat','🍽️','quiero comer','','I want to eat','fire',{card:1}),
            w('beber','','to drink','🥤','beber agua','','to drink water','water'),
            w('ir','','to go','🚶','vamos a ir','','we are going to go','mind'),
            w('ver','','to see','👀','quiero ver','','I want to see','light'),
            w('hablar','','to speak','💬','hablar español','','to speak Spanish','mind',{card:1}),
            w('querer','','to want / love','💭','te quiero','','I love you','heart'),
          ]},
        ]},
        { title: 'Unidad 7 · El tiempo', color: '#2bb89a', lessons: [
          { id: 'es7a', title: 'Time', terms: [
            w('hoy','','today','🌅','hoy es lunes','','today is Monday','time',{card:1}),
            w('mañana','','tomorrow','🌄','hasta mañana','','see you tomorrow','time',{card:1}),
            w('ayer','','yesterday','🌇','ayer llovió','','it rained yesterday','time'),
            w('ahora','','now','⏰','ahora mismo','','right now','time'),
            w('la semana','','week','🗓️','la próxima semana','','next week','time'),
          ]},
        ]},
        { title: 'Unidad 8 · Lugares', color: '#e8590c', lessons: [
          { id: 'es8a', title: 'Places', terms: [
            w('la casa','','house','🏠','mi casa','','my house','earth',{card:1}),
            w('la escuela','','school','🏫','voy a la escuela','','I go to school','mind',{card:1}),
            w('la ciudad','','city','🏙️','una ciudad grande','','a big city','earth'),
            w('la playa','','beach','🏖️','vamos a la playa','','let’s go to the beach','water'),
            w('el mercado','','market','🛒','en el mercado','','at the market','earth'),
          ]},
        ]},
      ],
    },

    /* ===================== FRENCH (taster) ===================== */
    fr: {
      id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', region: 'Europe',
      tts: 'fr-FR', from: 'English', mascot: '🐓', accent: '#3b5bdb', accentD: '#2f49b0',
      lives: { icon: '🥐', name: 'croissants' },
      rivals: [
        { id: 'r0', name: 'Coco', av: '🐓' }, { id: 'r1', name: 'Margot', av: '🐈' },
        { id: 'r2', name: 'Henri', av: '🦊' }, { id: 'r3', name: 'Margaux', av: '🦌' },
        { id: 'r4', name: 'Léon', av: '🦔' }, { id: 'r5', name: 'Brie', av: '🐭' },
        { id: 'r6', name: 'Roi', av: '🐉' },
      ],
      units: [
        { title: 'Unité 1 · Salutations', color: '#3b5bdb', lessons: [
          { id: 'fr1a', title: 'Greetings', terms: [
            w('bonjour','','hello','👋','Bonjour, madame !','','Hello, ma’am!','heart',{card:1}),
            w('merci','','thank you','🙏','Merci beaucoup.','','Thank you very much.','heart',{card:1}),
            w('au revoir','','goodbye','👋','Au revoir !','','Goodbye!','night'),
            w('s’il vous plaît','','please','🤲','De l’eau, s’il vous plaît.','','Water, please.','heart'),
          ]},
          { id: 'fr1b', title: 'Yes & No', terms: [
            w('oui','','yes','✅','Oui, bien sûr.','','Yes, of course.','light',{card:1}),
            w('non','','no','❌','Non, merci.','','No, thank you.','night'),
            w('je','','I','🙋','Je suis étudiant.','','I am a student.','heart'),
            w('tu','','you','👉','Et toi ?','','And you?','heart'),
          ]},
        ]},
        { title: 'Unité 2 · Nombres', color: '#1c7ed6', lessons: [
          { id: 'fr2a', title: 'One to Five', terms: [
            w('un','','one','1️⃣','un café','','one coffee','mind'),
            w('deux','','two','2️⃣','deux amis','','two friends','mind'),
            w('trois','','three','3️⃣','trois jours','','three days','mind'),
            w('quatre','','four','4️⃣','quatre chats','','four cats','mind'),
            w('cinq','','five','5️⃣','cinq euros','','five euros','mind',{card:1}),
          ]},
        ]},
        { title: 'Unité 3 · Couleurs', color: '#e64980', lessons: [
          { id: 'fr3a', title: 'Colors', terms: [
            w('rouge','','red','🟥','la pomme rouge','','the red apple','fire',{card:1}),
            w('bleu','','blue','🟦','le ciel bleu','','the blue sky','water',{card:1}),
            w('vert','','green','🟩','la feuille verte','','the green leaf','nature'),
            w('jaune','','yellow','🟨','le soleil jaune','','the yellow sun','light'),
            w('noir','','black','⬛','le chat noir','','the black cat','night'),
            w('blanc','','white','⬜','la neige blanche','','the white snow','light'),
          ]},
        ]},
        { title: 'Unité 4 · Famille', color: '#7048e8', lessons: [
          { id: 'fr4a', title: 'Family', terms: [
            w('mère','','mother','👩','ma mère','','my mother','heart',{card:1}),
            w('père','','father','👨','mon père','','my father','heart',{card:1}),
            w('frère','','brother','🧑','mon frère','','my brother','heart'),
            w('sœur','','sister','👧','ma sœur','','my sister','heart'),
            w('ami','','friend','🤝','un bon ami','','a good friend','heart',{card:1}),
          ]},
        ]},
        { title: 'Unité 5 · Nourriture', color: '#fab005', lessons: [
          { id: 'fr5a', title: 'Food', terms: [
            w('pain','','bread','🍞','du pain frais','','fresh bread','earth',{card:1}),
            w('eau','','water','💧','un verre d’eau','','a glass of water','water',{card:1}),
            w('pomme','','apple','🍎','une pomme rouge','','a red apple','nature'),
            w('fromage','','cheese','🧀','du fromage','','some cheese','earth'),
            w('café','','coffee','☕','un café','','a coffee','fire'),
          ]},
        ]},
        { title: 'Unité 6 · Verbes', color: '#0c8599', lessons: [
          { id: 'fr6a', title: 'Verbs', terms: [
            w('manger','','to eat','🍽️','je veux manger','','I want to eat','fire',{card:1}),
            w('boire','','to drink','🥤','boire de l’eau','','to drink water','water'),
            w('aller','','to go','🚶','on va aller','','we are going to go','mind'),
            w('voir','','to see','👀','je veux voir','','I want to see','light'),
            w('parler','','to speak','💬','parler français','','to speak French','mind',{card:1}),
            w('aimer','','to love','❤️','je t’aime','','I love you','heart'),
          ]},
        ]},
        { title: 'Unité 7 · Nombres 6–10', color: '#2bb89a', lessons: [
          { id: 'fr7a', title: 'Six to Ten', terms: [
            w('six','','six','6️⃣','','','','mind'),
            w('sept','','seven','7️⃣','','','','mind'),
            w('huit','','eight','8️⃣','','','','mind'),
            w('neuf','','nine','9️⃣','','','','mind'),
            w('dix','','ten','🔟','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== GERMAN (taster) ===================== */
    de: {
      id: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', region: 'Europe',
      tts: 'de-DE', from: 'English', mascot: '🦅', accent: '#c0392b', accentD: '#9c2a1f',
      lives: { icon: '🥨', name: 'pretzels' },
      rivals: [
        { id: 'r0', name: 'Bruno', av: '🐻' }, { id: 'r1', name: 'Adler', av: '🦅' },
        { id: 'r2', name: 'Wolf', av: '🐺' }, { id: 'r3', name: 'Hirsch', av: '🦌' },
        { id: 'r4', name: 'Fuchs', av: '🦊' }, { id: 'r5', name: 'Igel', av: '🦔' },
        { id: 'r6', name: 'Drache', av: '🐉' },
      ],
      units: [
        { title: 'Einheit 1 · Begrüßung', color: '#c0392b', lessons: [
          { id: 'de1a', title: 'Greetings', terms: [
            w('hallo','','hello','👋','Hallo, wie geht’s?','','Hello, how are you?','heart',{card:1}),
            w('danke','','thank you','🙏','Danke schön.','','Thank you.','heart',{card:1}),
            w('tschüss','','goodbye','👋','Tschüss!','','Bye!','night'),
            w('bitte','','please','🤲','Wasser, bitte.','','Water, please.','heart'),
          ]},
          { id: 'de1b', title: 'Yes & No', terms: [
            w('ja','','yes','✅','Ja, gern.','','Yes, gladly.','light',{card:1}),
            w('nein','','no','❌','Nein, danke.','','No, thanks.','night'),
            w('ich','','I','🙋','Ich bin Student.','','I am a student.','heart'),
            w('du','','you','👉','Und du?','','And you?','heart'),
          ]},
        ]},
        { title: 'Einheit 2 · Zahlen', color: '#1c7ed6', lessons: [
          { id: 'de2a', title: 'One to Five', terms: [
            w('eins','','one','1️⃣','eins, zwei, drei','','one, two, three','mind'),
            w('zwei','','two','2️⃣','zwei Katzen','','two cats','mind'),
            w('drei','','three','3️⃣','drei Tage','','three days','mind'),
            w('vier','','four','4️⃣','vier Freunde','','four friends','mind'),
            w('fünf','','five','5️⃣','fünf Euro','','five euros','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== JAPANESE (taster, with romaji) ===================== */
    ja: {
      id: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', region: 'East Asia',
      tts: 'ja-JP', from: 'English', mascot: '🦊', accent: '#d6336c', accentD: '#b02a59',
      lives: { icon: '🍙', name: 'onigiri' },
      rivals: [
        { id: 'r0', name: 'Tama', av: '🐱' }, { id: 'r1', name: 'Kon', av: '🦊' },
        { id: 'r2', name: 'Pon', av: '🦝' }, { id: 'r3', name: 'Usa', av: '🐰' },
        { id: 'r4', name: 'Tori', av: '🐦' }, { id: 'r5', name: 'Kame', av: '🐢' },
        { id: 'r6', name: 'Tora', av: '🐯' }, { id: 'r7', name: 'Ryū', av: '🐉' },
      ],
      units: [
        { title: 'ユニット1 · あいさつ', color: '#d6336c', lessons: [
          { id: 'ja1a', title: 'Greetings', terms: [
            w('こんにちは','konnichiwa','hello','👋','こんにちは！','konnichiwa!','Hello!','heart',{card:1}),
            w('ありがとう','arigatō','thank you','🙏','ありがとう！','arigatō!','Thank you!','heart',{card:1}),
            w('さようなら','sayōnara','goodbye','👋','さようなら。','sayōnara.','Goodbye.','night'),
            w('はい','hai','yes','✅','はい、そうです。','hai, sō desu.','Yes, that’s right.','light'),
            w('いいえ','iie','no','❌','いいえ。','iie.','No.','night'),
          ]},
          { id: 'ja1b', title: 'You & Me', terms: [
            w('わたし','watashi','I','🙋','わたしは学生です。','watashi wa gakusei desu.','I am a student.','heart',{card:1}),
            w('あなた','anata','you','👉','あなたは？','anata wa?','And you?','heart'),
            w('ねこ','neko','cat','🐱','ねこがすき。','neko ga suki.','I like cats.','nature',{card:1}),
            w('みず','mizu','water','💧','みずをのむ。','mizu o nomu.','Drink water.','water'),
          ]},
        ]},
        { title: 'ユニット2 · すうじ', color: '#1c7ed6', lessons: [
          { id: 'ja2a', title: 'One to Five', terms: [
            w('いち','ichi','one','1️⃣','いち、に、さん','ichi, ni, san','one, two, three','mind'),
            w('に','ni','two','2️⃣','にひき','ni hiki','two animals','mind'),
            w('さん','san','three','3️⃣','さんにん','san nin','three people','mind'),
            w('よん','yon','four','4️⃣','よじ','yo ji','four o’clock','mind'),
            w('ご','go','five','5️⃣','ごえん','go en','five yen','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== KOREAN (East Asia) ===================== */
    ko: {
      id: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', region: 'East Asia',
      tts: 'ko-KR', from: 'English', mascot: '🐯', accent: '#1e4fd0', accentD: '#163a9c',
      lives: { icon: '🥟', name: 'mandu' },
      rivals: [ { id:'r0',name:'Beom',av:'🐯'},{id:'r1',name:'Sapsal',av:'🐶'},{id:'r2',name:'Tokki',av:'🐰'},{id:'r3',name:'Kkachi',av:'🐦'},{id:'r4',name:'Gom',av:'🐻'},{id:'r5',name:'Yong',av:'🐲'} ],
      units: [
        { title: '단원 1 · 인사', color: '#1e4fd0', lessons: [
          { id: 'ko1a', title: 'Greetings', terms: [
            w('안녕하세요','annyeonghaseyo','hello','👋','안녕하세요!','annyeonghaseyo!','Hello!','heart',{card:1}),
            w('감사합니다','gamsahamnida','thank you','🙏','정말 감사합니다.','jeongmal gamsahamnida.','Thank you very much.','heart',{card:1}),
            w('안녕히 가세요','annyeonghi gaseyo','goodbye','👋','','','','night'),
            w('네','ne','yes','✅','','','','light'),
            w('아니요','aniyo','no','❌','','','','night'),
          ]},
          { id: 'ko1b', title: 'One to Three', terms: [
            w('하나','hana','one','1️⃣','','','','mind'),
            w('둘','dul','two','2️⃣','','','','mind'),
            w('셋','set','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== ITALIAN (Europe) ===================== */
    it: {
      id: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', region: 'Europe',
      tts: 'it-IT', from: 'English', mascot: '🐺', accent: '#1a7f37', accentD: '#14692c',
      lives: { icon: '🍕', name: 'pizze' },
      rivals: [ {id:'r0',name:'Lupo',av:'🐺'},{id:'r1',name:'Gatto',av:'🐱'},{id:'r2',name:'Coniglio',av:'🐰'},{id:'r3',name:'Aquila',av:'🦅'},{id:'r4',name:'Volpe',av:'🦊'},{id:'r5',name:'Drago',av:'🐉'} ],
      units: [
        { title: 'Unità 1 · Saluti', color: '#1a7f37', lessons: [
          { id: 'it1a', title: 'Greetings', terms: [
            w('ciao','','hello','👋','Ciao!','','Hi!','heart',{card:1}),
            w('grazie','','thank you','🙏','Grazie mille.','','Thanks a lot.','heart',{card:1}),
            w('arrivederci','','goodbye','👋','','','','night'),
            w('sì','','yes','✅','','','','light'),
            w('no','','no','❌','','','','night'),
          ]},
          { id: 'it1b', title: 'One to Three', terms: [
            w('uno','','one','1️⃣','','','','mind'),
            w('due','','two','2️⃣','','','','mind'),
            w('tre','','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== PORTUGUESE (Americas) ===================== */
    pt: {
      id: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷', region: 'Americas',
      tts: 'pt-BR', from: 'English', mascot: '🦜', accent: '#009c3b', accentD: '#00792d',
      lives: { icon: '🥥', name: 'cocos' },
      rivals: [ {id:'r0',name:'Arara',av:'🦜'},{id:'r1',name:'Onça',av:'🐆'},{id:'r2',name:'Tartaruga',av:'🐢'},{id:'r3',name:'Macaco',av:'🐵'},{id:'r4',name:'Tucano',av:'🐦'},{id:'r5',name:'Dragão',av:'🐉'} ],
      units: [
        { title: 'Unidade 1 · Saudações', color: '#009c3b', lessons: [
          { id: 'pt1a', title: 'Greetings', terms: [
            w('olá','','hello','👋','Olá!','','Hello!','heart',{card:1}),
            w('obrigado','','thank you','🙏','Muito obrigado.','','Thank you very much.','heart',{card:1}),
            w('tchau','','goodbye','👋','','','','night'),
            w('sim','','yes','✅','','','','light'),
            w('não','','no','❌','','','','night'),
          ]},
          { id: 'pt1b', title: 'One to Three', terms: [
            w('um','','one','1️⃣','','','','mind'),
            w('dois','','two','2️⃣','','','','mind'),
            w('três','','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== ENGLISH (Americas) — vocab w/ definitions ===================== */
    en: {
      id: 'en', name: 'English', native: 'English', flag: '🇺🇸', region: 'Americas',
      tts: 'en-US', from: 'English', mascot: '🦅', accent: '#1c7ed6', accentD: '#1567b3',
      lives: { icon: '🍔', name: 'burgers' },
      rivals: [ {id:'r0',name:'Eagle',av:'🦅'},{id:'r1',name:'Bear',av:'🐻'},{id:'r2',name:'Bison',av:'🦬'},{id:'r3',name:'Wolf',av:'🐺'},{id:'r4',name:'Beaver',av:'🦫'},{id:'r5',name:'Dragon',av:'🐉'} ],
      units: [
        { title: 'Unit 1 · Greetings', color: '#1c7ed6', lessons: [
          { id: 'en1a', title: 'Greetings', terms: [
            w('hello','','a greeting','👋','Hello there!','','a friendly greeting','heart',{card:1}),
            w('thank you','','words of thanks','🙏','Thank you so much.','','expressing gratitude','heart',{card:1}),
            w('goodbye','','a farewell','👋','','','','night'),
            w('yes','','agreement','✅','','','','light'),
            w('no','','refusal','❌','','','','night'),
          ]},
          { id: 'en1b', title: 'One to Three', terms: [
            w('one','','the number 1','1️⃣','','','','mind'),
            w('two','','the number 2','2️⃣','','','','mind'),
            w('three','','the number 3','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== ARABIC (Middle East) ===================== */
    ar: {
      id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', region: 'Middle East',
      tts: 'ar-SA', from: 'English', mascot: '🐪', accent: '#1f7a4d', accentD: '#155e3a',
      lives: { icon: '🫖', name: 'teas' },
      rivals: [ {id:'r0',name:'Jamal',av:'🐪'},{id:'r1',name:'Saqr',av:'🦅'},{id:'r2',name:'Hisan',av:'🐎'},{id:'r3',name:'Asad',av:'🦁'},{id:'r4',name:'Qit',av:'🐱'},{id:'r5',name:'Tinnin',av:'🐉'} ],
      units: [
        { title: 'الوحدة 1 · تحيات', color: '#1f7a4d', lessons: [
          { id: 'ar1a', title: 'Greetings', terms: [
            w('مرحبا','marhaban','hello','👋','مرحبا!','marhaban!','Hello!','heart',{card:1}),
            w('شكرا','shukran','thank you','🙏','شكرا جزيلا','shukran jazilan','Thank you very much','heart',{card:1}),
            w('مع السلامة','maʿa as-salāma','goodbye','👋','','','','night'),
            w('نعم','naʿam','yes','✅','','','','light'),
            w('لا','lā','no','❌','','','','night'),
          ]},
          { id: 'ar1b', title: 'One to Three', terms: [
            w('واحد','wāḥid','one','1️⃣','','','','mind'),
            w('اثنان','ithnān','two','2️⃣','','','','mind'),
            w('ثلاثة','thalātha','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== TURKISH (Middle East) ===================== */
    tr: {
      id: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', region: 'Middle East',
      tts: 'tr-TR', from: 'English', mascot: '🐺', accent: '#e30a17', accentD: '#b3000c',
      lives: { icon: '🍵', name: 'çay' },
      rivals: [ {id:'r0',name:'Kurt',av:'🐺'},{id:'r1',name:'Kedi',av:'🐱'},{id:'r2',name:'Kaplumbağa',av:'🐢'},{id:'r3',name:'Kartal',av:'🦅'},{id:'r4',name:'Tilki',av:'🦊'},{id:'r5',name:'Ejder',av:'🐉'} ],
      units: [
        { title: 'Ünite 1 · Selamlar', color: '#e30a17', lessons: [
          { id: 'tr1a', title: 'Greetings', terms: [
            w('merhaba','','hello','👋','Merhaba!','','Hello!','heart',{card:1}),
            w('teşekkürler','','thank you','🙏','Çok teşekkürler.','','Thanks a lot.','heart',{card:1}),
            w('hoşça kal','','goodbye','👋','','','','night'),
            w('evet','','yes','✅','','','','light'),
            w('hayır','','no','❌','','','','night'),
          ]},
          { id: 'tr1b', title: 'One to Three', terms: [
            w('bir','','one','1️⃣','','','','mind'),
            w('iki','','two','2️⃣','','','','mind'),
            w('üç','','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== HEBREW (Middle East) ===================== */
    he: {
      id: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', region: 'Middle East',
      tts: 'he-IL', from: 'English', mascot: '🦁', accent: '#0038b8', accentD: '#002a8c',
      lives: { icon: '🫒', name: 'olives' },
      rivals: [ {id:'r0',name:'Aryeh',av:'🦁'},{id:'r1',name:'Tzvi',av:'🦌'},{id:'r2',name:'Gamal',av:'🐪'},{id:'r3',name:'Nesher',av:'🦅'},{id:'r4',name:'Dov',av:'🐻'},{id:'r5',name:'Tanin',av:'🐉'} ],
      units: [
        { title: 'יחידה 1 · ברכות', color: '#0038b8', lessons: [
          { id: 'he1a', title: 'Greetings', terms: [
            w('שלום','shalom','hello','👋','שלום!','shalom!','Hello!','heart',{card:1}),
            w('תודה','toda','thank you','🙏','תודה רבה','toda raba','Thank you very much','heart',{card:1}),
            w('להתראות','lehitraʾot','goodbye','👋','','','','night'),
            w('כן','ken','yes','✅','','','','light'),
            w('לא','lo','no','❌','','','','night'),
          ]},
          { id: 'he1b', title: 'One to Three', terms: [
            w('אחד','echad','one','1️⃣','','','','mind'),
            w('שתיים','shtayim','two','2️⃣','','','','mind'),
            w('שלוש','shalosh','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== HINDI (South Asia) ===================== */
    hi: {
      id: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', region: 'South Asia',
      tts: 'hi-IN', from: 'English', mascot: '🐯', accent: '#ff9933', accentD: '#e07b00',
      lives: { icon: '🪔', name: 'diye' },
      rivals: [ {id:'r0',name:'Bagh',av:'🐯'},{id:'r1',name:'Hathi',av:'🐘'},{id:'r2',name:'Mor',av:'🦚'},{id:'r3',name:'Bandar',av:'🐵'},{id:'r4',name:'Hiran',av:'🦌'},{id:'r5',name:'Nag',av:'🐍'} ],
      units: [
        { title: 'इकाई 1 · अभिवादन', color: '#ff9933', lessons: [
          { id: 'hi1a', title: 'Greetings', terms: [
            w('नमस्ते','namaste','hello','👋','नमस्ते!','namaste!','Hello!','heart',{card:1}),
            w('धन्यवाद','dhanyavaad','thank you','🙏','बहुत धन्यवाद','bahut dhanyavaad','Thank you very much','heart',{card:1}),
            w('अलविदा','alvida','goodbye','👋','','','','night'),
            w('हाँ','haan','yes','✅','','','','light'),
            w('नहीं','nahin','no','❌','','','','night'),
          ]},
          { id: 'hi1b', title: 'One to Three', terms: [
            w('एक','ek','one','1️⃣','','','','mind'),
            w('दो','do','two','2️⃣','','','','mind'),
            w('तीन','teen','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== URDU (South Asia) ===================== */
    ur: {
      id: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', region: 'South Asia',
      tts: 'ur-PK', from: 'English', mascot: '🐆', accent: '#01411c', accentD: '#002d13',
      lives: { icon: '🌙', name: 'moons' },
      rivals: [ {id:'r0',name:'Sher',av:'🐯'},{id:'r1',name:'Hathi',av:'🐘'},{id:'r2',name:'Mor',av:'🦚'},{id:'r3',name:'Bandar',av:'🐵'},{id:'r4',name:'Lomri',av:'🦊'},{id:'r5',name:'Azhdaha',av:'🐉'} ],
      units: [
        { title: 'یونٹ 1 · سلام', color: '#01411c', lessons: [
          { id: 'ur1a', title: 'Greetings', terms: [
            w('السلام علیکم','assalam-o-alaikum','hello','👋','السلام علیکم!','assalam-o-alaikum!','Peace be upon you!','heart',{card:1}),
            w('شکریہ','shukriya','thank you','🙏','بہت شکریہ','bohat shukriya','Thank you very much','heart',{card:1}),
            w('خدا حافظ','khuda hafiz','goodbye','👋','','','','night'),
            w('جی ہاں','ji haan','yes','✅','','','','light'),
            w('نہیں','nahin','no','❌','','','','night'),
          ]},
          { id: 'ur1b', title: 'One to Three', terms: [
            w('ایک','aik','one','1️⃣','','','','mind'),
            w('دو','do','two','2️⃣','','','','mind'),
            w('تین','teen','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== BENGALI (South Asia) ===================== */
    bn: {
      id: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', region: 'South Asia',
      tts: 'bn-BD', from: 'English', mascot: '🐅', accent: '#006a4e', accentD: '#00553e',
      lives: { icon: '🐟', name: 'fish' },
      rivals: [ {id:'r0',name:'Bagh',av:'🐅'},{id:'r1',name:'Hati',av:'🐘'},{id:'r2',name:'Moyur',av:'🦚'},{id:'r3',name:'Banor',av:'🐵'},{id:'r4',name:'Horin',av:'🦌'},{id:'r5',name:'Nag',av:'🐍'} ],
      units: [
        { title: 'একক 1 · শুভেচ্ছা', color: '#006a4e', lessons: [
          { id: 'bn1a', title: 'Greetings', terms: [
            w('নমস্কার','nômoshkar','hello','👋','নমস্কার!','nômoshkar!','Hello!','heart',{card:1}),
            w('ধন্যবাদ','dhonnobad','thank you','🙏','অনেক ধন্যবাদ','ônek dhonnobad','Thank you very much','heart',{card:1}),
            w('বিদায়','biday','goodbye','👋','','','','night'),
            w('হ্যাঁ','hêañ','yes','✅','','','','light'),
            w('না','na','no','❌','','','','night'),
          ]},
          { id: 'bn1b', title: 'One to Three', terms: [
            w('এক','êk','one','1️⃣','','','','mind'),
            w('দুই','dui','two','2️⃣','','','','mind'),
            w('তিন','tin','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== SWAHILI (Africa) ===================== */
    sw: {
      id: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', region: 'Africa',
      tts: 'sw-KE', from: 'English', mascot: '🦁', accent: '#1a7f37', accentD: '#14692c',
      lives: { icon: '🥁', name: 'ngoma' },
      rivals: [ {id:'r0',name:'Simba',av:'🦁'},{id:'r1',name:'Tembo',av:'🐘'},{id:'r2',name:'Twiga',av:'🦒'},{id:'r3',name:'Punda',av:'🦓'},{id:'r4',name:'Chui',av:'🐆'},{id:'r5',name:'Kifaru',av:'🦏'} ],
      units: [
        { title: 'Kipindi 1 · Salamu', color: '#1a7f37', lessons: [
          { id: 'sw1a', title: 'Greetings', terms: [
            w('jambo','','hello','👋','Jambo!','','Hello!','heart',{card:1}),
            w('asante','','thank you','🙏','Asante sana.','','Thank you very much.','heart',{card:1}),
            w('kwaheri','','goodbye','👋','','','','night'),
            w('ndiyo','','yes','✅','','','','light'),
            w('hapana','','no','❌','','','','night'),
          ]},
          { id: 'sw1b', title: 'One to Three', terms: [
            w('moja','','one','1️⃣','','','','mind'),
            w('mbili','','two','2️⃣','','','','mind'),
            w('tatu','','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== ZULU (Africa) ===================== */
    zu: {
      id: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', region: 'Africa',
      tts: 'zu-ZA', from: 'English', mascot: '🦏', accent: '#0a7d2c', accentD: '#06591f',
      lives: { icon: '🛡️', name: 'shields' },
      rivals: [ {id:'r0',name:'Ibhubesi',av:'🦁'},{id:'r1',name:'Indlovu',av:'🐘'},{id:'r2',name:'Ubhejane',av:'🦏'},{id:'r3',name:'Idube',av:'🦓'},{id:'r4',name:'Ingwe',av:'🐆'},{id:'r5',name:'Ufudu',av:'🐢'} ],
      units: [
        { title: 'Iyunithi 1 · Imikhuleko', color: '#0a7d2c', lessons: [
          { id: 'zu1a', title: 'Greetings', terms: [
            w('sawubona','','hello','👋','Sawubona!','','Hello!','heart',{card:1}),
            w('ngiyabonga','','thank you','🙏','Ngiyabonga kakhulu.','','Thank you very much.','heart',{card:1}),
            w('hamba kahle','','goodbye','👋','','','','night'),
            w('yebo','','yes','✅','','','','light'),
            w('cha','','no','❌','','','','night'),
          ]},
          { id: 'zu1b', title: 'One to Three', terms: [
            w('kunye','','one','1️⃣','','','','mind'),
            w('kubili','','two','2️⃣','','','','mind'),
            w('kuthathu','','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== YORUBA (Africa) ===================== */
    yo: {
      id: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', region: 'Africa',
      tts: 'yo-NG', from: 'English', mascot: '🐆', accent: '#008751', accentD: '#00633b',
      lives: { icon: '🥁', name: 'ìlù' },
      rivals: [ {id:'r0',name:'Kìnìún',av:'🦁'},{id:'r1',name:'Erin',av:'🐘'},{id:'r2',name:'Ẹkùn',av:'🐆'},{id:'r3',name:'Ọbọ',av:'🐵'},{id:'r4',name:'Àkùkọ',av:'🐓'},{id:'r5',name:'Dragoni',av:'🐉'} ],
      units: [
        { title: 'Ìdá 1 · Ìkíni', color: '#008751', lessons: [
          { id: 'yo1a', title: 'Greetings', terms: [
            w('báwo ni','','hello','👋','Báwo ni!','','How are you / Hello!','heart',{card:1}),
            w('ẹ ṣé','','thank you','🙏','Ẹ ṣé gan-an.','','Thank you very much.','heart',{card:1}),
            w('ó dàbọ̀','','goodbye','👋','','','','night'),
            w('bẹ́ẹ̀ni','','yes','✅','','','','light'),
            w('rárá','','no','❌','','','','night'),
          ]},
          { id: 'yo1b', title: 'One to Three', terms: [
            w('ọ̀kan','','one','1️⃣','','','','mind'),
            w('èjì','','two','2️⃣','','','','mind'),
            w('ẹ̀ta','','three','3️⃣','','','','mind',{card:1}),
          ]},
        ]},
      ],
    },

    /* ===================== RUSSIAN (Europe) ===================== */
    ru: { id:'ru', name:'Russian', native:'Русский', flag:'🇷🇺', region:'Europe',
      tts:'ru-RU', from:'English', mascot:'🐻', accent:'#3155a6', accentD:'#264484',
      lives:{icon:'🪆',name:'matryoshkas'},
      rivals:[{id:'r0',name:'Misha',av:'🐻'},{id:'r1',name:'Zayats',av:'🐰'},{id:'r2',name:'Lisa',av:'🦊'},{id:'r3',name:'Volk',av:'🐺'},{id:'r4',name:'Oryol',av:'🦅'},{id:'r5',name:'Drakon',av:'🐉'}],
      units:[{title:'Раздел 1 · Приветствия', color:'#3155a6', lessons:[
        {id:'ru1a', title:'Greetings', terms:[
          w('привет','privet','hello','👋','Привет!','privet!','Hi!','heart',{card:1}),
          w('спасибо','spasibo','thank you','🙏','Спасибо большое','spasibo bolshoye','Thank you very much','heart',{card:1}),
          w('пока','poka','goodbye','👋','','','','night'),
          w('да','da','yes','✅','','','','light'),
          w('нет','net','no','❌','','','','night'),
        ]},
        {id:'ru1b', title:'One to Three', terms:[
          w('один','odin','one','1️⃣','','','','mind'),
          w('два','dva','two','2️⃣','','','','mind'),
          w('три','tri','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== POLISH (Europe) ===================== */
    pl: { id:'pl', name:'Polish', native:'Polski', flag:'🇵🇱', region:'Europe',
      tts:'pl-PL', from:'English', mascot:'🦬', accent:'#dc143c', accentD:'#b01030',
      lives:{icon:'🥟',name:'pierogi'},
      rivals:[{id:'r0',name:'Żubr',av:'🦬'},{id:'r1',name:'Bocian',av:'🐦'},{id:'r2',name:'Lis',av:'🦊'},{id:'r3',name:'Wilk',av:'🐺'},{id:'r4',name:'Orzeł',av:'🦅'},{id:'r5',name:'Smok',av:'🐉'}],
      units:[{title:'Dział 1 · Powitania', color:'#dc143c', lessons:[
        {id:'pl1a', title:'Greetings', terms:[
          w('cześć','','hello','👋','Cześć!','','Hi!','heart',{card:1}),
          w('dziękuję','','thank you','🙏','Dziękuję bardzo','','Thank you very much','heart',{card:1}),
          w('do widzenia','','goodbye','👋','','','','night'),
          w('tak','','yes','✅','','','','light'),
          w('nie','','no','❌','','','','night'),
        ]},
        {id:'pl1b', title:'One to Three', terms:[
          w('jeden','','one','1️⃣','','','','mind'),
          w('dwa','','two','2️⃣','','','','mind'),
          w('trzy','','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== DUTCH (Europe) ===================== */
    nl: { id:'nl', name:'Dutch', native:'Nederlands', flag:'🇳🇱', region:'Europe',
      tts:'nl-NL', from:'English', mascot:'🐮', accent:'#ff7f00', accentD:'#d96c00',
      lives:{icon:'🧀',name:'kazen'},
      rivals:[{id:'r0',name:'Koe',av:'🐮'},{id:'r1',name:'Haas',av:'🐰'},{id:'r2',name:'Vos',av:'🦊'},{id:'r3',name:'Zwaan',av:'🦢'},{id:'r4',name:'Leeuw',av:'🦁'},{id:'r5',name:'Draak',av:'🐉'}],
      units:[{title:'Deel 1 · Begroetingen', color:'#ff7f00', lessons:[
        {id:'nl1a', title:'Greetings', terms:[
          w('hallo','','hello','👋','Hallo!','','Hello!','heart',{card:1}),
          w('dank je','','thank you','🙏','Dank je wel','','Thank you very much','heart',{card:1}),
          w('doei','','goodbye','👋','','','','night'),
          w('ja','','yes','✅','','','','light'),
          w('nee','','no','❌','','','','night'),
        ]},
        {id:'nl1b', title:'One to Three', terms:[
          w('een','','one','1️⃣','','','','mind'),
          w('twee','','two','2️⃣','','','','mind'),
          w('drie','','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== GREEK (Europe) ===================== */
    el: { id:'el', name:'Greek', native:'Ελληνικά', flag:'🇬🇷', region:'Europe',
      tts:'el-GR', from:'English', mascot:'🦉', accent:'#0d5eaf', accentD:'#0a4a8c',
      lives:{icon:'🫒',name:'olives'},
      rivals:[{id:'r0',name:'Koukouvagia',av:'🦉'},{id:'r1',name:'Delfini',av:'🐬'},{id:'r2',name:'Alepou',av:'🦊'},{id:'r3',name:'Aetos',av:'🦅'},{id:'r4',name:'Liontari',av:'🦁'},{id:'r5',name:'Drakos',av:'🐉'}],
      units:[{title:'Ενότητα 1 · Χαιρετισμοί', color:'#0d5eaf', lessons:[
        {id:'el1a', title:'Greetings', terms:[
          w('γεια σου','yia su','hello','👋','Γεια σου!','yia su!','Hello!','heart',{card:1}),
          w('ευχαριστώ','efharistó','thank you','🙏','Ευχαριστώ πολύ','efharistó polí','Thank you very much','heart',{card:1}),
          w('αντίο','adío','goodbye','👋','','','','night'),
          w('ναι','ne','yes','✅','','','','light'),
          w('όχι','óhi','no','❌','','','','night'),
        ]},
        {id:'el1b', title:'One to Three', terms:[
          w('ένα','éna','one','1️⃣','','','','mind'),
          w('δύο','dýo','two','2️⃣','','','','mind'),
          w('τρία','tría','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== VIETNAMESE (Southeast Asia) ===================== */
    vi: { id:'vi', name:'Vietnamese', native:'Tiếng Việt', flag:'🇻🇳', region:'Southeast Asia',
      tts:'vi-VN', from:'English', mascot:'🐃', accent:'#da251d', accentD:'#b01e17',
      lives:{icon:'🍜',name:'phở bowls'},
      rivals:[{id:'r0',name:'Trâu',av:'🐃'},{id:'r1',name:'Gà',av:'🐓'},{id:'r2',name:'Cá',av:'🐟'},{id:'r3',name:'Khỉ',av:'🐵'},{id:'r4',name:'Hổ',av:'🐯'},{id:'r5',name:'Rồng',av:'🐉'}],
      units:[{title:'Bài 1 · Chào hỏi', color:'#da251d', lessons:[
        {id:'vi1a', title:'Greetings', terms:[
          w('xin chào','','hello','👋','Xin chào!','','Hello!','heart',{card:1}),
          w('cảm ơn','','thank you','🙏','Cảm ơn nhiều','','Thank you very much','heart',{card:1}),
          w('tạm biệt','','goodbye','👋','','','','night'),
          w('vâng','','yes','✅','','','','light'),
          w('không','','no','❌','','','','night'),
        ]},
        {id:'vi1b', title:'One to Three', terms:[
          w('một','','one','1️⃣','','','','mind'),
          w('hai','','two','2️⃣','','','','mind'),
          w('ba','','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== INDONESIAN (Southeast Asia) ===================== */
    id: { id:'id', name:'Indonesian', native:'Bahasa Indonesia', flag:'🇮🇩', region:'Southeast Asia',
      tts:'id-ID', from:'English', mascot:'🦧', accent:'#ce1126', accentD:'#a60d1e',
      lives:{icon:'🍚',name:'nasi'},
      rivals:[{id:'r0',name:'Orangutan',av:'🦧'},{id:'r1',name:'Komodo',av:'🦎'},{id:'r2',name:'Gajah',av:'🐘'},{id:'r3',name:'Burung',av:'🦜'},{id:'r4',name:'Harimau',av:'🐯'},{id:'r5',name:'Naga',av:'🐉'}],
      units:[{title:'Unit 1 · Salam', color:'#ce1126', lessons:[
        {id:'id1a', title:'Greetings', terms:[
          w('halo','','hello','👋','Halo!','','Hello!','heart',{card:1}),
          w('terima kasih','','thank you','🙏','Terima kasih banyak','','Thank you very much','heart',{card:1}),
          w('sampai jumpa','','goodbye','👋','','','','night'),
          w('ya','','yes','✅','','','','light'),
          w('tidak','','no','❌','','','','night'),
        ]},
        {id:'id1b', title:'One to Three', terms:[
          w('satu','','one','1️⃣','','','','mind'),
          w('dua','','two','2️⃣','','','','mind'),
          w('tiga','','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== THAI (Southeast Asia) ===================== */
    th: { id:'th', name:'Thai', native:'ไทย', flag:'🇹🇭', region:'Southeast Asia',
      tts:'th-TH', from:'English', mascot:'🐘', accent:'#241d4f', accentD:'#1a1540',
      lives:{icon:'🍍',name:'pineapples'},
      rivals:[{id:'r0',name:'Chang',av:'🐘'},{id:'r1',name:'Ling',av:'🐵'},{id:'r2',name:'Pla',av:'🐟'},{id:'r3',name:'Nok',av:'🐦'},{id:'r4',name:'Suea',av:'🐯'},{id:'r5',name:'Naga',av:'🐉'}],
      units:[{title:'บทที่ 1 · ทักทาย', color:'#241d4f', lessons:[
        {id:'th1a', title:'Greetings', terms:[
          w('สวัสดี','sawatdi','hello','👋','สวัสดี!','sawatdi!','Hello!','heart',{card:1}),
          w('ขอบคุณ','khop khun','thank you','🙏','ขอบคุณมาก','khop khun mak','Thank you very much','heart',{card:1}),
          w('ลาก่อน','la kon','goodbye','👋','','','','night'),
          w('ใช่','chai','yes','✅','','','','light'),
          w('ไม่','mai','no','❌','','','','night'),
        ]},
        {id:'th1b', title:'One to Three', terms:[
          w('หนึ่ง','nueng','one','1️⃣','','','','mind'),
          w('สอง','song','two','2️⃣','','','','mind'),
          w('สาม','sam','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },

    /* ===================== FILIPINO (Southeast Asia) ===================== */
    tl: { id:'tl', name:'Filipino', native:'Tagalog', flag:'🇵🇭', region:'Southeast Asia',
      tts:'fil-PH', from:'English', mascot:'🦅', accent:'#0038a8', accentD:'#002c85',
      lives:{icon:'🥭',name:'mangoes'},
      rivals:[{id:'r0',name:'Agila',av:'🦅'},{id:'r1',name:'Kalabaw',av:'🐃'},{id:'r2',name:'Unggoy',av:'🐵'},{id:'r3',name:'Pating',av:'🦈'},{id:'r4',name:'Tigre',av:'🐯'},{id:'r5',name:'Dragon',av:'🐉'}],
      units:[{title:'Aralin 1 · Pagbati', color:'#0038a8', lessons:[
        {id:'tl1a', title:'Greetings', terms:[
          w('kamusta','','hello','👋','Kamusta!','','Hello!','heart',{card:1}),
          w('salamat','','thank you','🙏','Maraming salamat','','Thank you very much','heart',{card:1}),
          w('paalam','','goodbye','👋','','','','night'),
          w('oo','','yes','✅','','','','light'),
          w('hindi','','no','❌','','','','night'),
        ]},
        {id:'tl1b', title:'One to Three', terms:[
          w('isa','','one','1️⃣','','','','mind'),
          w('dalawa','','two','2️⃣','','','','mind'),
          w('tatlo','','three','3️⃣','','','','mind',{card:1}),
        ]},
      ]}],
    },
  };

  // ---- derive ids + stats (one source of truth) ----
  Object.values(COURSES).forEach(course => {
    course.units.forEach((u, ui) => {
      u.index = ui;
      u.lessons.forEach((l, li) => {
        l.unitIndex = ui; l.lessonIndex = li; l.color = u.color;
        l.terms.forEach((term, ti) => {
          term.id = `${course.id}:${l.id}:${ti}`;
          term.courseId = course.id;
          term.unitIndex = ui;
          term.tts = course.tts;
          term.realm = term.realm || 'mind';
          term.hp = term.legendary ? 160 : 70 + term.term.length * 12;
          term.power = term.legendary ? 60 : term.card ? 40 : 30;
          term.rarity = term.legendary ? 'legendary' : term.card ? 'rare' : 'common';
        });
      });
    });
  });

  function allTerms(courseId) {
    const out = [];
    COURSES[courseId].units.forEach(u => u.lessons.forEach(l => l.terms.forEach(t => out.push(t))));
    return out;
  }
  const collectibles = courseId => allTerms(courseId).filter(t => t.card);
  // languages without a pronunciation aid (Spanish/French/German) → never show "pinyin"
  Object.values(COURSES).forEach(c => { c.hasReading = allTerms(c.id).some(t => t.reading); });
  function lessonById(courseId, id) {
    let found = null;
    COURSES[courseId].units.forEach(u => u.lessons.forEach(l => { if (l.id === id) found = l; }));
    return found;
  }

  window.LINGO = { COURSES, REALMS, allTerms, collectibles, lessonById };
})();
