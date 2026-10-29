/* ============================================================
 * 时文阅读数据(8 篇分级短文)
 * level 1 = 一~三年级(简单句) 2 = 四年级 3 = 五~六年级
 * paras: [{en: 英文段, cn: 中文翻译}]  newWords: 生词表  quiz: 阅读理解
 * ============================================================ */
window.ARTICLES = [
{
  id: 'a1', emoji: '🎒', color: '#FF9F43', level: 1,
  title: 'My School Day', cn: '我的上学日',
  desc: '早上七点起床,背上书包,开心的一天开始啦!',
  newWords: [
    { w: 'wake up',   m: 'v. 醒来' },
    { w: 'get ready', m: '准备好' },
    { w: 'uniform',   m: 'n. 校服' },
    { w: 'arrive',    m: 'v. 到达' },
    { w: 'bell',      m: 'n. 铃;钟' }
  ],
  paras: [
    { en: 'Every morning, I wake up at seven oclock. I wash my face and get ready for school.', cn: '每天早上,我七点醒来。我洗好脸,准备好上学的东西。' },
    { en: 'I wear my school uniform and eat breakfast with my family. My favourite breakfast is bread and milk.', cn: '我穿上校服,和家人一起吃早餐。我最喜欢的早餐是面包和牛奶。' },
    { en: 'At eight oclock, I arrive at school. The bell rings, and class begins. We read, write and count.', cn: '八点钟,我到达学校。铃声响起,开始上课。我们读书、写字和数数。' },
    { en: 'After school, I play with my friends. Then I go home and do my homework. What a happy day!', cn: '放学后,我和朋友们一起玩。然后我回家做作业。多么快乐的一天啊!' }
  ],
  quiz: [
    { q: 'When does the writer wake up?', opts: ['At six oclock', 'At seven oclock', 'At eight oclock'], a: 1 },
    { q: 'What is the writers favourite breakfast?', opts: ['Bread and milk', 'Noodles and eggs', 'Cake and juice'], a: 0 },
    { q: 'What does the writer do after school?', opts: ['Sleeps at once', 'Plays with friends', 'Watches TV all day'], a: 1 }
  ]
},
{
  id: 'a2', emoji: '🐨', color: '#4CB880', level: 1,
  title: 'Animal Friends', cn: '动物朋友',
  desc: '有的跑得快,有的鼻子长,动物世界真奇妙!',
  newWords: [
    { w: 'forest',   m: 'n. 森林' },
    { w: 'fast',     m: 'adv. 快地' },
    { w: 'trunk',    m: 'n. 象鼻' },
    { w: 'bamboo',   m: 'n. 竹子' },
    { w: 'protect',  m: 'v. 保护' }
  ],
  paras: [
    { en: 'Animals are our friends. They live in forests, rivers and mountains. They make the world beautiful.', cn: '动物是我们的朋友。它们生活在森林里、河流里和高山上。它们让世界变得美丽。' },
    { en: 'The rabbit can run fast. The elephant has a long trunk and big ears. The panda eats bamboo all day.', cn: '兔子跑得很快。大象有长长的鼻子和大大的耳朵。熊猫整天吃竹子。' },
    { en: 'Some animals sleep in winter, like bears. Some birds fly to warm places when it is cold.', cn: '有些动物冬天睡觉,比如熊。天气冷的时候,有些鸟会飞去温暖的地方。' },
    { en: 'Animals need our help. We should protect them and never hurt them. Let us be good friends!', cn: '动物需要我们的帮助。我们应该保护它们,永远不伤害它们。让我们成为好朋友吧!' }
  ],
  quiz: [
    { q: 'What does the panda eat?', opts: ['Meat', 'Bamboo', 'Fish'], a: 1 },
    { q: 'Which animals sleep in winter?', opts: ['Birds', 'Rabbits', 'Bears'], a: 2 },
    { q: 'What should we do for animals?', opts: ['Protect them', 'Hurt them', 'Feed them candy'], a: 0 }
  ]
},
{
  id: 'a3', emoji: '🍂', color: '#F4543E', level: 2,
  title: 'The Four Seasons', cn: '四季',
  desc: '春花、夏雨、秋叶、冬雪,一年四季各有各的美。',
  newWords: [
    { w: 'bloom',   m: 'v. 开花' },
    { w: 'harvest', m: 'n./v. 收获' },
    { w: 'leaf',    m: 'n. 叶子(复数 leaves)' },
    { w: 'sweater', m: 'n. 毛衣' },
    { w: 'snowman', m: 'n. 雪人' }
  ],
  paras: [
    { en: 'There are four seasons in a year. Each season is different and each one is beautiful.', cn: '一年有四个季节。每个季节都不同,每一个都很美丽。' },
    { en: 'In spring, flowers bloom and birds sing. The weather is warm. Children like to fly kites in the park.', cn: '春天,花儿开放,鸟儿歌唱。天气很温暖。孩子们喜欢在公园里放风筝。' },
    { en: 'Summer is very hot. We can swim in the sea and eat ice cream. The days are long and the nights are short.', cn: '夏天非常热。我们可以在海里游泳,吃冰淇淋。白天长,夜晚短。' },
    { en: 'In autumn, leaves turn yellow and fall. Farmers harvest their crops. It is cool, so we wear sweaters.', cn: '秋天,树叶变黄落下。农民们收获庄稼。天气凉爽,我们穿上毛衣。' },
    { en: 'Winter is cold and it often snows. We can make snowmen and play in the snow. What fun!', cn: '冬天很冷,经常下雪。我们可以堆雪人,在雪地里玩。多有趣啊!' }
  ],
  quiz: [
    { q: 'What do children do in the park in spring?', opts: ['Swim', 'Fly kites', 'Make snowmen'], a: 1 },
    { q: 'Why do we wear sweaters in autumn?', opts: ['Because it is cool', 'Because it is hot', 'Because it snows'], a: 0 },
    { q: 'In which season do farmers harvest crops?', opts: ['Spring', 'Summer', 'Autumn'], a: 2 }
  ]
},
{
  id: 'a4', emoji: '🦁', color: '#9B7BFF', level: 2,
  title: 'A Trip to the Zoo', cn: '动物园之旅',
  desc: '猴子调皮、孔雀开屏,动物园里学到了很多知识!',
  newWords: [
    { w: 'naughty',  m: 'adj. 调皮的' },
    { w: 'peacock',  m: 'n. 孔雀' },
    { w: 'feather',  m: 'n. 羽毛' },
    { w: 'keeper',   m: 'n. 饲养员' },
    { w: 'sign',     m: 'n. 标牌' }
  ],
  paras: [
    { en: 'Last Friday, our class went to the zoo. We took the bus and arrived at nine oclock.', cn: '上周五,我们全班去了动物园。我们坐公交车,九点到达。' },
    { en: 'First, we saw the monkeys. They were so naughty! One monkey took a boys hat and ran away. Everyone laughed.', cn: '首先,我们看了猴子。它们太调皮了!一只猴子拿走了一个男孩的帽子跑掉了。大家都笑了。' },
    { en: 'Then we watched the peacocks. A peacock opened its tail. Its feathers were blue and green, like a big fan.', cn: '然后我们看了孔雀。一只孔雀开屏了。它的羽毛是蓝色和绿色的,像一把大扇子。' },
    { en: 'The zoo keeper told us a lot about animals. He said, "Please do not feed the animals. Read the signs and love them." We learned a lot that day.', cn: '饲养员给我们讲了很多关于动物的知识。他说:"请不要投喂动物。看看标牌,爱护它们。"那天我们学到了很多。' }
  ],
  quiz: [
    { q: 'How did the class go to the zoo?', opts: ['By bus', 'By train', 'On foot'], a: 0 },
    { q: 'What did the monkey take?', opts: ['A banana', 'A hat', 'A book'], a: 1 },
    { q: 'What did the zoo keeper ask children to do?', opts: ['Feed the animals', 'Run and shout', 'Read the signs'], a: 2 }
  ]
},
{
  id: 'a5', emoji: '🥗', color: '#2BB3A3', level: 2,
  title: 'Eating Healthy Food', cn: '健康饮食',
  desc: '蔬菜水果要多吃,糖果可乐要少碰,身体才能棒棒的!',
  newWords: [
    { w: 'healthy',  m: 'adj. 健康的' },
    { w: 'energy',   m: 'n. 能量' },
    { w: 'junk food',m: 'n. 垃圾食品' },
    { w: 'instead',  m: 'adv. 代替' },
    { w: 'habit',    m: 'n. 习惯' }
  ],
  paras: [
    { en: 'Good food makes us strong and healthy. We need different kinds of food every day.', cn: '好的食物让我们强壮又健康。我们每天需要各种各样的食物。' },
    { en: 'Vegetables and fruit give us vitamins. Milk makes our bones strong. Rice and bread give us energy to run and play.', cn: '蔬菜和水果给我们维生素。牛奶让我们的骨骼强壮。米饭和面包给我们奔跑和玩耍的能量。' },
    { en: 'But candy, chips and cola are junk food. They taste good, but too much of them is bad for our teeth and body.', cn: '但是糖果、薯片和可乐是垃圾食品。它们味道不错,但吃太多对我们的牙齿和身体不好。' },
    { en: 'Next time you want a snack, eat an apple or a banana instead. Good eating habits start today!', cn: '下次想吃零食的时候,换成苹果或香蕉吧。好的饮食习惯从今天开始!' }
  ],
  quiz: [
    { q: 'What makes our bones strong?', opts: ['Cola', 'Milk', 'Chips'], a: 1 },
    { q: 'Which one is junk food?', opts: ['Apple', 'Candy', 'Rice'], a: 1 },
    { q: 'What snack does the writer suggest?', opts: ['An apple or a banana', 'Ice cream', 'French fries'], a: 0 }
  ]
},
{
  id: 'a6', emoji: '🏃', color: '#6C8CFF', level: 2,
  title: 'Sports Day', cn: '运动会',
  desc: '接力赛最后一棒,我拼命奔跑……名次不是最重要的!',
  newWords: [
    { w: 'relay race', m: 'n. 接力赛' },
    { w: 'cheer',      m: 'v. 欢呼;加油' },
    { w: 'winner',     m: 'n. 获胜者' },
    { w: 'proud',      m: 'adj. 自豪的' },
    { w: 'teamwork',   m: 'n. 团队合作' }
  ],
  paras: [
    { en: 'Last week, our school had a Sports Day. The playground was full of happy children and colourful flags.', cn: '上周,我们学校举办了运动会。操场上满是快乐的孩子和彩色的旗帜。' },
    { en: 'I was in the relay race. I ran the last part. When my friend passed me the baton, I ran as fast as I could.', cn: '我参加了接力赛,跑最后一棒。当朋友把接力棒递给我时,我拼尽全力奔跑。' },
    { en: 'My classmates cheered loudly, "Come on! Come on!" In the end, our class came second. We were not the winner, but we were happy.', cn: '同学们大声欢呼:"加油!加油!"最后,我们班得了第二名。我们不是冠军,但大家都很开心。' },
    { en: 'Our teacher said, "You did great teamwork. I am proud of you all." That was the best Sports Day ever!', cn: '老师说:"你们的团队合作很棒,我为你们所有人感到自豪。"那是有史以来最棒的运动会!' }
  ],
  quiz: [
    { q: 'Which part of the relay race did the writer run?', opts: ['The first part', 'The last part', 'The middle part'], a: 1 },
    { q: 'What place did the class get?', opts: ['First', 'Second', 'Third'], a: 1 },
    { q: 'Why was the teacher proud?', opts: ['They won first place', 'They had great teamwork', 'They ran fastest'], a: 1 }
  ]
},
{
  id: 'a7', emoji: '🤖', color: '#4EA8FF', level: 3,
  title: 'The Little Robot Helper', cn: '小机器人助手',
  desc: '小明家来了一个机器人,它还会算数学题呢!未来的生活会是什么样?',
  newWords: [
    { w: 'invent',    m: 'v. 发明' },
    { w: 'reminder',  m: 'n. 提醒' },
    { w: 'battery',   m: 'n. 电池' },
    { w: 'temperature', m: 'n. 温度' },
    { w: 'lazy',      m: 'adj. 懒惰的' }
  ],
  paras: [
    { en: 'Last month, Mings family bought a little robot. His name is Dodo. He is about as tall as a ten-year-old child, and he has two big blue eyes.', cn: '上个月,小明家买了一个小机器人。它的名字叫多多。它大约和一个十岁的孩子一样高,有一双蓝色的大眼睛。' },
    { en: 'Dodo can do many things. He wakes Ming up in the morning and gives him reminders about homework. He can even help Mum cook rice and wash vegetables.', cn: '多多会做很多事情。它早上叫小明起床,提醒他做作业。它甚至能帮妈妈煮饭、洗菜。' },
    { en: 'Dodo knows a lot, too. He can answer questions about weather and space. When Ming asks, "Why is the moon bright at night?" Dodo always has a good answer.', cn: '多多还知道很多知识。它能回答关于天气和太空的问题。当小明问"为什么晚上月亮是亮的?"多多总能给出很好的回答。' },
    { en: 'But Dodo cannot do everything. He needs to charge his battery every night, and he never does Mings homework for him. "You should learn by yourself," he says with a smile.', cn: '但多多不是什么都能做。它每天晚上要充电,而且从不帮小明做作业。"你应该自己学习,"它微笑着说。' },
    { en: 'In the future, robots will help us more and more. But remember: a clever brain is still better than a clever robot!', cn: '将来,机器人会帮助我们越来越多。但是记住:聪明的头脑永远比聪明的机器人更厉害!' }
  ],
  quiz: [
    { q: 'What does Dodo look like?', opts: ['As tall as a ten-year-old child', 'As small as a cat', 'As big as a car'], a: 0 },
    { q: 'What can Dodo NOT do?', opts: ['Cook rice', 'Answer questions', 'Do Mings homework'], a: 2 },
    { q: 'What does the story want to tell us?', opts: ['Robots will replace students', 'Learning by yourself is important', 'Robots are lazy'], a: 1 }
  ]
},
{
  id: 'a8', emoji: '🌏', color: '#FF7BA9', level: 3,
  title: 'Plastic in the Ocean', cn: '海洋里的塑料',
  desc: '一只海龟和一只塑料袋的故事,告诉我们为什么要少用塑料。',
  newWords: [
    { w: 'plastic',  m: 'n. 塑料' },
    { w: 'turtle',   m: 'n. 海龟' },
    { w: 'jellyfish',m: 'n. 水母' },
    { w: 'similar',  m: 'adj. 相似的' },
    { w: 'reuse',    m: 'v. 重复使用' }
  ],
  paras: [
    { en: 'The ocean is home to many animals: fish, whales and turtles. But today, there is a big problem in their home — plastic.', cn: '海洋是许多动物的家园:鱼、鲸鱼和海龟。但今天,它们的家园遇到了一个大问题——塑料。' },
    { en: 'Every year, people throw millions of plastic bags and bottles into the sea. A plastic bag in water looks very similar to a jellyfish. Sea turtles often eat it by mistake and get very sick.', cn: '每年,人们把数百万个塑料袋和塑料瓶扔进大海。水里的塑料袋看起来很像水母。海龟经常误食它们,病得很重。' },
    { en: 'Plastic does not disappear quickly. A plastic bottle can stay in the sea for hundreds of years. Fish may eat small pieces of it, and then we may eat those fish!', cn: '塑料不会很快消失。一个塑料瓶可以在海里待上几百年。鱼可能会吃到塑料的小碎片,然后我们可能又会吃到那些鱼!' },
    { en: 'The good news is: we can help. Use a cloth bag instead of a plastic one. Take your own bottle to school. Reuse and recycle. Small actions can save the big ocean!', cn: '好消息是:我们可以帮忙。用布袋代替塑料袋,自己带水瓶上学,重复使用、回收利用。小小的行动能拯救大大的海洋!' }
  ],
  quiz: [
    { q: 'What does a plastic bag in water look like?', opts: ['A turtle', 'A jellyfish', 'A fish'], a: 1 },
    { q: 'How long can a plastic bottle stay in the sea?', opts: ['Ten years', 'A hundred days', 'Hundreds of years'], a: 2 },
    { q: 'Which is NOT suggested in the passage?', opts: ['Use a cloth bag', 'Reuse and recycle', 'Throw bottles into the sea'], a: 2 }
  ]
}
];
