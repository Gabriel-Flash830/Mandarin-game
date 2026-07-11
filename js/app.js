/* ============================================================
   WordWisp — app engine (vanilla JS, zero dependencies)

   • One delegated click handler (data-action) → clicks never break.
   • Learning is REQUIRED to act (wrong answer misses in battle).
   • Per-language theming: colour, mascot, lives token, rival animals.
   ============================================================ */
(function () {
  const BRAND = 'WordWisp';                 // ← rename the app here, one place
  const TAGLINE = 'Mastered, not memorized.';
  const CROW = '🐦‍⬛';                       // app mascot (logo). Each language has its own animal.

  const { COURSES, REALMS, allTerms, collectibles, lessonById } = window.LINGO;
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---- App-language (base language) so anyone can use the app in their language ---- */
  const UILANGS = {
    en: { name: 'English', flag: '🇬🇧' }, es: { name: 'Español', flag: '🇪🇸' }, fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' }, zh: { name: '中文', flag: '🇨🇳' }, pt: { name: 'Português', flag: '🇧🇷' },
    ar: { name: 'العربية', flag: '🇸🇦' }, hi: { name: 'हिन्दी', flag: '🇮🇳' },
  };
  const STR = {
    en: { nav_learn:'Learn', nav_study:'Study', nav_cards:'Cards', nav_arena:'Arena', nav_me:'Me', continue:'Continue', check:'Check', start:'Start', study_title:'Study Archive', cards_title:'Word Cards', arena_title:'Arena', me_title:'Your Progress', new_word:'New word', mean_q:'What does this mean?', unit:'Unit' },
    es: { unit:'Unidad', nav_learn:'Aprender', nav_study:'Estudiar', nav_cards:'Cartas', nav_arena:'Arena', nav_me:'Yo', continue:'Continuar', check:'Comprobar', start:'Empezar', study_title:'Archivo de estudio', cards_title:'Cartas de palabras', arena_title:'Arena', me_title:'Tu progreso', new_word:'Palabra nueva', mean_q:'¿Qué significa esto?' },
    fr: { unit:'Unité', nav_learn:'Apprendre', nav_study:'Réviser', nav_cards:'Cartes', nav_arena:'Arène', nav_me:'Moi', continue:'Continuer', check:'Vérifier', start:'Commencer', study_title:'Archive d’étude', cards_title:'Cartes de mots', arena_title:'Arène', me_title:'Ta progression', new_word:'Nouveau mot', mean_q:'Que signifie ceci ?' },
    de: { unit:'Einheit', nav_learn:'Lernen', nav_study:'Üben', nav_cards:'Karten', nav_arena:'Arena', nav_me:'Ich', continue:'Weiter', check:'Prüfen', start:'Start', study_title:'Lern-Archiv', cards_title:'Wortkarten', arena_title:'Arena', me_title:'Dein Fortschritt', new_word:'Neues Wort', mean_q:'Was bedeutet das?' },
    zh: { unit:'单元', nav_learn:'学习', nav_study:'复习', nav_cards:'卡片', nav_arena:'竞技场', nav_me:'我', continue:'继续', check:'检查', start:'开始', study_title:'学习档案', cards_title:'单词卡', arena_title:'竞技场', me_title:'你的进度', new_word:'新词', mean_q:'这是什么意思？' },
    pt: { unit:'Unidade', nav_learn:'Aprender', nav_study:'Estudar', nav_cards:'Cartas', nav_arena:'Arena', nav_me:'Eu', continue:'Continuar', check:'Verificar', start:'Começar', study_title:'Arquivo de estudo', cards_title:'Cartas de palavras', arena_title:'Arena', me_title:'Seu progresso', new_word:'Palavra nova', mean_q:'O que isto significa?' },
    ar: { unit:'الوحدة', nav_learn:'تعلّم', nav_study:'دراسة', nav_cards:'بطاقات', nav_arena:'الساحة', nav_me:'أنا', continue:'متابعة', check:'تحقّق', start:'ابدأ', study_title:'أرشيف الدراسة', cards_title:'بطاقات الكلمات', arena_title:'الساحة', me_title:'تقدّمك', new_word:'كلمة جديدة', mean_q:'ماذا يعني هذا؟' },
    hi: { unit:'इकाई', nav_learn:'सीखें', nav_study:'अभ्यास', nav_cards:'कार्ड', nav_arena:'अखाड़ा', nav_me:'मैं', continue:'जारी रखें', check:'जाँचें', start:'शुरू', study_title:'अध्ययन संग्रह', cards_title:'शब्द कार्ड', arena_title:'अखाड़ा', me_title:'आपकी प्रगति', new_word:'नया शब्द', mean_q:'इसका क्या अर्थ है?' },
  };
  const tr = k => (STR[S.uiLang] && STR[S.uiLang][k]) || STR.en[k] || k;
  // Label translations (unit/lesson names + profile), keyed by the English text.
  const T2 = {
    'Total XP':{fr:'XP total',es:'XP total',de:'Gesamt-XP',pt:'XP total',zh:'总经验'},
    'Streak':{fr:'Série',es:'Racha',de:'Serie',pt:'Sequência',zh:'连续'},
    'Lessons':{fr:'Leçons',es:'Lecciones',de:'Lektionen',pt:'Lições',zh:'课程'},
    'Rivals beat':{fr:'Rivaux vaincus',es:'Rivales vencidos',de:'Besiegte Rivalen',pt:'Rivais vencidos',zh:'击败对手'},
    'Reset progress':{fr:'Réinitialiser',es:'Reiniciar',de:'Zurücksetzen',pt:'Redefinir',zh:'重置进度'},
    'Save':{fr:'Enregistrer',es:'Guardar',de:'Speichern',pt:'Salvar',zh:'保存'},
    'Test':{fr:'Tester',es:'Probar',de:'Testen',pt:'Testar',zh:'测试'},
    'Learning':{fr:'Tu apprends',es:'Aprendiendo',de:'Du lernst',pt:'Aprendendo',zh:'正在学习'},
    'First Words':{fr:'Premiers mots',es:'Primeras palabras',de:'Erste Wörter',pt:'Primeiras palavras',zh:'初级词汇'},
    'Numbers':{fr:'Nombres',es:'Números',de:'Zahlen',pt:'Números',zh:'数字'},
    'Time':{fr:'Le temps',es:'El tiempo',de:'Zeit',pt:'Tempo',zh:'时间'},
    'People & Family':{fr:'Gens & famille',es:'Personas y familia',de:'Menschen & Familie',pt:'Pessoas e família',zh:'人与家庭'},
    'Nature':{fr:'Nature',es:'Naturaleza',de:'Natur',pt:'Natureza',zh:'自然'},
    'Animals':{fr:'Animaux',es:'Animales',de:'Tiere',pt:'Animais',zh:'动物'},
    'Food & Drink':{fr:'Nourriture & boisson',es:'Comida y bebida',de:'Essen & Trinken',pt:'Comida e bebida',zh:'食物与饮料'},
    'Everyday Verbs':{fr:'Verbes courants',es:'Verbos cotidianos',de:'Alltagsverben',pt:'Verbos do dia a dia',zh:'日常动词'},
    'Colors':{fr:'Couleurs',es:'Colores',de:'Farben',pt:'Cores',zh:'颜色'},
    'Describing':{fr:'Décrire',es:'Describir',de:'Beschreiben',pt:'Descrever',zh:'描述'},
    'Greetings':{fr:'Salutations',es:'Saludos',de:'Begrüßungen',pt:'Saudações',zh:'问候'},
    'You & Me':{fr:'Toi & moi',es:'Tú y yo',de:'Du & ich',pt:'Você e eu',zh:'你和我'},
    'Yes & No':{fr:'Oui & non',es:'Sí y no',de:'Ja & nein',pt:'Sim e não',zh:'是与否'},
    'One to Five':{fr:'Un à cinq',es:'Uno a cinco',de:'Eins bis fünf',pt:'Um a cinco',zh:'一到五'},
    'Six to Ten':{fr:'Six à dix',es:'Seis a diez',de:'Sechs bis zehn',pt:'Seis a dez',zh:'六到十'},
    'Big Numbers':{fr:'Grands nombres',es:'Números grandes',de:'Große Zahlen',pt:'Números grandes',zh:'大数字'},
    'One to Three':{fr:'Un à trois',es:'Uno a tres',de:'Eins bis drei',pt:'Um a três',zh:'一到三'},
    'Family':{fr:'Famille',es:'Familia',de:'Familie',pt:'Família',zh:'家庭'},
    'People':{fr:'Les gens',es:'Personas',de:'Menschen',pt:'Pessoas',zh:'人'},
    'Pets':{fr:'Animaux',es:'Mascotas',de:'Haustiere',pt:'Animais de estimação',zh:'宠物'},
    'Wild':{fr:'Sauvages',es:'Salvajes',de:'Wildtiere',pt:'Selvagens',zh:'野生'},
    'Food':{fr:'Nourriture',es:'Comida',de:'Essen',pt:'Comida',zh:'食物'},
    'Verbs':{fr:'Verbes',es:'Verbos',de:'Verben',pt:'Verbos',zh:'动词'},
    'Sky':{fr:'Le ciel',es:'El cielo',de:'Himmel',pt:'Céu',zh:'天空'},
    'Elements':{fr:'Éléments',es:'Elementos',de:'Elemente',pt:'Elementos',zh:'元素'},
    'Eat & Drink':{fr:'Manger & boire',es:'Comer y beber',de:'Essen & Trinken',pt:'Comer e beber',zh:'吃与喝'},
    'Learn a language':{fr:'Apprendre une langue',es:'Aprender un idioma',de:'Sprache lernen',pt:'Aprender um idioma',zh:'学习语言'},
    'App language':{fr:'Langue de l’application',es:'Idioma de la app',de:'App-Sprache',pt:'Idioma do app',zh:'应用语言'},
    'Placement test — start at your level':{fr:'Test de niveau — commence à ton niveau',es:'Prueba de nivel — empieza en tu nivel',de:'Einstufungstest — starte auf deinem Niveau',pt:'Teste de nivelamento — comece no seu nível',zh:'分级测试——从你的水平开始'},
    'Voice — cloud TTS':{fr:'Voix — TTS cloud',es:'Voz — TTS en la nube',de:'Stimme — Cloud-TTS',pt:'Voz — TTS na nuvem',zh:'语音——云端TTS'},
    'installable as an app':{fr:'installable comme application',es:'instalable como app',de:'als App installierbar',pt:'instalável como app',zh:'可安装为应用'},
    'Daily quest: earn 20 XP':{fr:'Quête du jour : gagne 20 XP',es:'Misión diaria: gana 20 XP',de:'Tagesquest: 20 XP sammeln',pt:'Missão diária: ganhe 20 XP',zh:'每日任务：获得20经验'},
    'Claim':{fr:'Réclamer',es:'Reclamar',de:'Abholen',pt:'Resgatar',zh:'领取'},
    'Sound effects':{fr:'Effets sonores',es:'Efectos de sonido',de:'Soundeffekte',pt:'Efeitos sonoros',zh:'音效'},
    'On':{fr:'Activés',es:'Sí',de:'An',pt:'Ligado',zh:'开'},
    'Off':{fr:'Désactivés',es:'No',de:'Aus',pt:'Desligado',zh:'关'},
    'Weak':{fr:'Faibles',es:'Débiles',de:'Schwach',pt:'Fracas',zh:'薄弱'},
    'New to':{fr:'Nouveau en',es:'¿Nuevo en',de:'Neu bei',pt:'Novo em',zh:'刚开始学'},
    'Take a 1-minute placement test to skip ahead.':{fr:'Fais un test de niveau d’une minute pour avancer.',es:'Haz una prueba de nivel de 1 minuto para adelantar.',de:'Mach den 1-Minuten-Einstufungstest zum Überspringen.',pt:'Faça um teste de nivelamento de 1 minuto para avançar.',zh:'花一分钟做分级测试，跳过已会的内容。'},
    'Test me':{fr:'Teste-moi',es:'Ponme a prueba',de:'Teste mich',pt:'Teste-me',zh:'测我'},
    'Flip through your words. Pick what shows on the front.':{fr:'Feuillette tes mots. Choisis ce qui s’affiche au recto.',es:'Repasa tus palabras. Elige qué se muestra al frente.',de:'Blättere durch deine Wörter. Wähle die Vorderseite.',pt:'Folheie suas palavras. Escolha o que aparece na frente.',zh:'翻看你的单词。选择正面显示的内容。'},
    'Collected':{fr:'Collectées',es:'Coleccionadas',de:'Gesammelt',pt:'Coletadas',zh:'已收集'},
    'All words':{fr:'Tous les mots',es:'Todas las palabras',de:'Alle Wörter',pt:'Todas as palavras',zh:'全部单词'},
    'tap to reveal':{fr:'touche pour révéler',es:'toca para revelar',de:'zum Aufdecken tippen',pt:'toque para revelar',zh:'点击翻面'},
    'Fixed':{fr:'Fixe',es:'Fijo',de:'Fest',pt:'Fixo',zh:'固定'},
    'Alternate':{fr:'Alterné',es:'Alternado',de:'Wechselnd',pt:'Alternado',zh:'交替'},
    'Battle rivals, add friends, and run a tournament.':{fr:'Affronte des rivaux, ajoute des amis et lance un tournoi.',es:'Lucha contra rivales, agrega amigos y organiza un torneo.',de:'Kämpfe gegen Rivalen, füge Freunde hinzu, starte ein Turnier.',pt:'Enfrente rivais, adicione amigos e faça um torneio.',zh:'挑战对手、添加好友、举办锦标赛。'},
    'Rivals':{fr:'Rivaux',es:'Rivales',de:'Rivalen',pt:'Rivais',zh:'对手'},
    'Friends':{fr:'Amis',es:'Amigos',de:'Freunde',pt:'Amigos',zh:'好友'},
    'Tournament':{fr:'Tournoi',es:'Torneo',de:'Turnier',pt:'Torneio',zh:'锦标赛'},
    'A gentle first rival.':{fr:'Un premier rival tout doux.',es:'Un primer rival suave.',de:'Ein sanfter erster Rivale.',pt:'Um primeiro rival tranquilo.',zh:'温和的第一个对手。'},
    'Beat the previous rival to unlock':{fr:'Bats le rival précédent pour débloquer',es:'Vence al rival anterior para desbloquear',de:'Besiege den vorherigen Rivalen zum Freischalten',pt:'Vença o rival anterior para desbloquear',zh:'击败上一个对手解锁'},
    'correct answers to win':{fr:'bonnes réponses pour gagner',es:'respuestas correctas para ganar',de:'richtige Antworten zum Sieg',pt:'respostas certas para vencer',zh:'个正确答案获胜'},
    'Easy':{fr:'Facile',es:'Fácil',de:'Leicht',pt:'Fácil',zh:'简单'},
    'Medium':{fr:'Moyen',es:'Medio',de:'Mittel',pt:'Médio',zh:'中等'},
    'Hard':{fr:'Difficile',es:'Difícil',de:'Schwer',pt:'Difícil',zh:'困难'},
    'Cloud account':{fr:'Compte cloud',es:'Cuenta en la nube',de:'Cloud-Konto',pt:'Conta na nuvem',zh:'云账户'},
    'Connected':{fr:'Connecté',es:'Conectado',de:'Verbunden',pt:'Conectado',zh:'已连接'},
    'progress syncs across devices':{fr:'la progression se synchronise entre appareils',es:'el progreso se sincroniza entre dispositivos',de:'Fortschritt synchronisiert sich',pt:'o progresso sincroniza entre dispositivos',zh:'进度多设备同步'},
    'One step left':{fr:'Une étape restante',es:'Falta un paso',de:'Ein Schritt fehlt',pt:'Falta um passo',zh:'还差一步'},
    'Offline':{fr:'Hors ligne',es:'Sin conexión',de:'Offline',pt:'Offline',zh:'离线'},
    'Global weekly top 10':{fr:'Top 10 mondial de la semaine',es:'Top 10 global semanal',de:'Globale Top 10 der Woche',pt:'Top 10 global da semana',zh:'本周全球前十'},
    'Cloud off — see Me tab':{fr:'Cloud désactivé — voir l’onglet Moi',es:'Nube desactivada — ver pestaña Yo',de:'Cloud aus — siehe Ich-Tab',pt:'Nuvem desligada — veja a aba Eu',zh:'云端未开启——见“我”标签'},
    'Daily quest: finish 2 new lessons':{fr:'Quête du jour : finis 2 nouvelles leçons',es:'Misión diaria: termina 2 lecciones nuevas',de:'Tagesquest: 2 neue Lektionen',pt:'Missão diária: 2 lições novas',zh:'每日任务：完成2节新课'},
    'Daily quest: win a battle':{fr:'Quête du jour : gagne un combat',es:'Misión diaria: gana una batalla',de:'Tagesquest: gewinne einen Kampf',pt:'Missão diária: vença uma batalha',zh:'每日任务：赢得一场对战'},
    'Streak freeze':{fr:'Gel de série',es:'Protector de racha',de:'Serien-Schutz',pt:'Protetor de sequência',zh:'连胜冻结'},
  };
  const tl = s => (T2[s] && T2[s][S.uiLang]) || s;
  // Word-MEANING translations keyed by the English gloss (fr/es/de; falls back to English).
  const MEANINGS = {
    'hello':{fr:'bonjour',es:'hola',de:'hallo'},'thank you':{fr:'merci',es:'gracias',de:'danke'},
    'goodbye':{fr:'au revoir',es:'adiós',de:'tschüss'},'please':{fr:'s’il te plaît',es:'por favor',de:'bitte'},
    'sorry':{fr:'pardon',es:'perdón',de:'Entschuldigung'},'yes':{fr:'oui',es:'sí',de:'ja'},'no':{fr:'non',es:'no',de:'nein'},
    'one':{fr:'un',es:'uno',de:'eins'},'two':{fr:'deux',es:'dos',de:'zwei'},'three':{fr:'trois',es:'tres',de:'drei'},
    'four':{fr:'quatre',es:'cuatro',de:'vier'},'five':{fr:'cinq',es:'cinco',de:'fünf'},'six':{fr:'six',es:'seis',de:'sechs'},
    'seven':{fr:'sept',es:'siete',de:'sieben'},'eight':{fr:'huit',es:'ocho',de:'acht'},'nine':{fr:'neuf',es:'nueve',de:'neun'},
    'ten':{fr:'dix',es:'diez',de:'zehn'},'hundred':{fr:'cent',es:'cien',de:'hundert'},'thousand':{fr:'mille',es:'mil',de:'tausend'},
    'ten thousand':{fr:'dix mille',es:'diez mil',de:'zehntausend'},'zero':{fr:'zéro',es:'cero',de:'null'},
    'two (of)':{fr:'deux (de)',es:'dos (de)',de:'zwei (von)'},'I / me':{fr:'je / moi',es:'yo',de:'ich'},
    'you':{fr:'tu / toi',es:'tú',de:'du'},'he':{fr:'il',es:'él',de:'er'},'she':{fr:'elle',es:'ella',de:'sie'},
    'we / us':{fr:'nous',es:'nosotros',de:'wir'},'to be / yes':{fr:'être / oui',es:'ser / sí',de:'sein / ja'},
    'not / no':{fr:'ne pas / non',es:'no',de:'nicht / nein'},'good':{fr:'bon',es:'bueno',de:'gut'},
    'correct':{fr:'correct',es:'correcto',de:'richtig'},'also':{fr:'aussi',es:'también',de:'auch'},
    'today':{fr:'aujourd’hui',es:'hoy',de:'heute'},'tomorrow':{fr:'demain',es:'mañana',de:'morgen'},
    'yesterday':{fr:'hier',es:'ayer',de:'gestern'},'day / sky':{fr:'jour / ciel',es:'día / cielo',de:'Tag / Himmel'},
    'now':{fr:'maintenant',es:'ahora',de:'jetzt'},'year':{fr:'année',es:'año',de:'Jahr'},
    'month / moon':{fr:'mois / lune',es:'mes / luna',de:'Monat / Mond'},'day / sun':{fr:'jour / soleil',es:'día / sol',de:'Tag / Sonne'},
    'week':{fr:'semaine',es:'semana',de:'Woche'},'o’clock':{fr:'heure',es:'en punto',de:'Uhr'},
    'mom':{fr:'maman',es:'mamá',de:'Mama'},'dad':{fr:'papa',es:'papá',de:'Papa'},
    'older brother':{fr:'grand frère',es:'hermano mayor',de:'älterer Bruder'},'older sister':{fr:'grande sœur',es:'hermana mayor',de:'ältere Schwester'},
    'home / family':{fr:'maison / famille',es:'casa / familia',de:'Zuhause / Familie'},'person':{fr:'personne',es:'persona',de:'Person'},
    'friend':{fr:'ami',es:'amigo',de:'Freund'},'teacher':{fr:'professeur',es:'maestro',de:'Lehrer'},
    'student':{fr:'étudiant',es:'estudiante',de:'Student'},'name':{fr:'nom',es:'nombre',de:'Name'},
    'sun':{fr:'soleil',es:'sol',de:'Sonne'},'moon':{fr:'lune',es:'luna',de:'Mond'},'star':{fr:'étoile',es:'estrella',de:'Stern'},
    'cloud':{fr:'nuage',es:'nube',de:'Wolke'},'wind':{fr:'vent',es:'viento',de:'Wind'},'water':{fr:'eau',es:'agua',de:'Wasser'},
    'fire':{fr:'feu',es:'fuego',de:'Feuer'},'mountain':{fr:'montagne',es:'montaña',de:'Berg'},'tree':{fr:'arbre',es:'árbol',de:'Baum'},
    'rain':{fr:'pluie',es:'lluvia',de:'Regen'},'flower':{fr:'fleur',es:'flor',de:'Blume'},'sea':{fr:'mer',es:'mar',de:'Meer'},
    'stone':{fr:'pierre',es:'piedra',de:'Stein'},'soil / earth':{fr:'terre',es:'tierra',de:'Erde'},'grass':{fr:'herbe',es:'hierba',de:'Gras'},
    'cat':{fr:'chat',es:'gato',de:'Katze'},'dog':{fr:'chien',es:'perro',de:'Hund'},'bird':{fr:'oiseau',es:'pájaro',de:'Vogel'},
    'fish':{fr:'poisson',es:'pez',de:'Fisch'},'rabbit':{fr:'lapin',es:'conejo',de:'Hase'},'horse':{fr:'cheval',es:'caballo',de:'Pferd'},
    'panda':{fr:'panda',es:'panda',de:'Panda'},'tiger':{fr:'tigre',es:'tigre',de:'Tiger'},'chicken':{fr:'poulet',es:'pollo',de:'Huhn'},
    'dragon':{fr:'dragon',es:'dragón',de:'Drache'},'to eat':{fr:'manger',es:'comer',de:'essen'},'to drink':{fr:'boire',es:'beber',de:'trinken'},
    'rice':{fr:'riz',es:'arroz',de:'Reis'},'tea':{fr:'thé',es:'té',de:'Tee'},'bread':{fr:'pain',es:'pan',de:'Brot'},
    'tasty':{fr:'délicieux',es:'rico',de:'lecker'},'apple':{fr:'pomme',es:'manzana',de:'Apfel'},'meat':{fr:'viande',es:'carne',de:'Fleisch'},
    'dish / vegetable':{fr:'plat / légume',es:'plato / verdura',de:'Gericht / Gemüse'},'egg':{fr:'œuf',es:'huevo',de:'Ei'},
    'to go':{fr:'aller',es:'ir',de:'gehen'},'to come':{fr:'venir',es:'venir',de:'kommen'},'to walk / leave':{fr:'marcher / partir',es:'caminar / irse',de:'gehen / weggehen'},
    'to run':{fr:'courir',es:'correr',de:'laufen'},'to sit':{fr:'s’asseoir',es:'sentarse',de:'sitzen'},
    'to look / read':{fr:'regarder / lire',es:'mirar / leer',de:'schauen / lesen'},'to speak':{fr:'parler',es:'hablar',de:'sprechen'},
    'to listen':{fr:'écouter',es:'escuchar',de:'hören'},'to want / miss':{fr:'vouloir / manquer',es:'querer / extrañar',de:'wollen / vermissen'},
    'to know':{fr:'savoir',es:'saber',de:'wissen'},'to love':{fr:'aimer',es:'amar',de:'lieben'},'to learn':{fr:'apprendre',es:'aprender',de:'lernen'},
    'to like':{fr:'aimer bien',es:'gustar',de:'mögen'},'to have':{fr:'avoir',es:'tener',de:'haben'},'to do / make':{fr:'faire',es:'hacer',de:'machen'},
    'to see':{fr:'voir',es:'ver',de:'sehen'},'to want / love':{fr:'vouloir / aimer',es:'querer',de:'wollen / lieben'},
    'red':{fr:'rouge',es:'rojo',de:'rot'},'blue':{fr:'bleu',es:'azul',de:'blau'},'green':{fr:'vert',es:'verde',de:'grün'},
    'yellow':{fr:'jaune',es:'amarillo',de:'gelb'},'white':{fr:'blanc',es:'blanco',de:'weiß'},'black':{fr:'noir',es:'negro',de:'schwarz'},
    'color':{fr:'couleur',es:'color',de:'Farbe'},'big':{fr:'grand',es:'grande',de:'groß'},'small':{fr:'petit',es:'pequeño',de:'klein'},
    'many':{fr:'beaucoup',es:'muchos',de:'viele'},'few':{fr:'peu',es:'pocos',de:'wenige'},'tall / high':{fr:'grand / haut',es:'alto',de:'hoch'},
    'hot':{fr:'chaud',es:'caliente',de:'heiß'},'cold':{fr:'froid',es:'frío',de:'kalt'},'new':{fr:'nouveau',es:'nuevo',de:'neu'},
    'fast':{fr:'rapide',es:'rápido',de:'schnell'},'pretty':{fr:'joli',es:'bonito',de:'hübsch'},
    'mother':{fr:'mère',es:'madre',de:'Mutter'},'father':{fr:'père',es:'padre',de:'Vater'},
    'brother':{fr:'frère',es:'hermano',de:'Bruder'},'sister':{fr:'sœur',es:'hermana',de:'Schwester'},
    'cheese':{fr:'fromage',es:'queso',de:'Käse'},'coffee':{fr:'café',es:'café',de:'Kaffee'},
    'house':{fr:'maison',es:'casa',de:'Haus'},'school':{fr:'école',es:'escuela',de:'Schule'},
    'city':{fr:'ville',es:'ciudad',de:'Stadt'},'shop':{fr:'magasin',es:'tienda',de:'Laden'},'park':{fr:'parc',es:'parque',de:'Park'},'hospital':{fr:'hôpital',es:'hospital',de:'Krankenhaus'},'what':{fr:'quoi',es:'qué',de:'was'},'who':{fr:'qui',es:'quién',de:'wer'},'where':{fr:'où',es:'dónde',de:'wo'},'why':{fr:'pourquoi',es:'por qué',de:'warum'},'how':{fr:'comment',es:'cómo',de:'wie'},'beach':{fr:'plage',es:'playa',de:'Strand'},'market':{fr:'marché',es:'mercado',de:'Markt'},
    'hand':{fr:'main',es:'mano',de:'Hand'},'head':{fr:'tête',es:'cabeza',de:'Kopf'},'eyes':{fr:'yeux',es:'ojos',de:'Augen'},
    'ears':{fr:'oreilles',es:'orejas',de:'Ohren'},'mouth':{fr:'bouche',es:'boca',de:'Mund'},
    'clothes':{fr:'vêtements',es:'ropa',de:'Kleidung'},'shoes':{fr:'chaussures',es:'zapatos',de:'Schuhe'},
    'hat':{fr:'chapeau',es:'sombrero',de:'Hut'},'pants':{fr:'pantalon',es:'pantalones',de:'Hose'},
    'to wear':{fr:'porter',es:'llevar puesto',de:'tragen'},'weather':{fr:'météo',es:'clima',de:'Wetter'},
    'sunny':{fr:'ensoleillé',es:'soleado',de:'sonnig'},'snow':{fr:'neige',es:'nieve',de:'Schnee'},
    'overcast':{fr:'couvert',es:'nublado',de:'bewölkt'},'windy':{fr:'venteux',es:'ventoso',de:'windig'},
    'happy':{fr:'heureux',es:'feliz',de:'glücklich'},'tired':{fr:'fatigué',es:'cansado',de:'müde'},
    'hungry':{fr:'affamé',es:'hambriento',de:'hungrig'},'thirsty':{fr:'assoiffé',es:'sediento',de:'durstig'},
    'busy':{fr:'occupé',es:'ocupado',de:'beschäftigt'},'book':{fr:'livre',es:'libro',de:'Buch'},
    'pen':{fr:'stylo',es:'bolígrafo',de:'Stift'},'desk':{fr:'bureau',es:'escritorio',de:'Schreibtisch'},
    'chair':{fr:'chaise',es:'silla',de:'Stuhl'},'computer':{fr:'ordinateur',es:'computadora',de:'Computer'},
    'car':{fr:'voiture',es:'coche',de:'Auto'},'train':{fr:'train',es:'tren',de:'Zug'},'airplane':{fr:'avion',es:'avión',de:'Flugzeug'},
    'bus':{fr:'bus',es:'autobús',de:'Bus'},'bicycle':{fr:'vélo',es:'bicicleta',de:'Fahrrad'},'to buy':{fr:'acheter',es:'comprar',de:'kaufen'},
    'to sleep':{fr:'dormir',es:'dormir',de:'schlafen'},'to get up':{fr:'se lever',es:'levantarse',de:'aufstehen'},
    'to work':{fr:'travailler',es:'trabajar',de:'arbeiten'},'to play':{fr:'jouer',es:'jugar',de:'spielen'},
    'to ask':{fr:'demander',es:'preguntar',de:'fragen'},'to write':{fr:'écrire',es:'escribir',de:'schreiben'},
    'to help':{fr:'aider',es:'ayudar',de:'helfen'},'to give':{fr:'donner',es:'dar',de:'geben'},
    'to make a phone call':{fr:'téléphoner',es:'llamar por teléfono',de:'telefonieren'},
    'the color red':{fr:'la couleur rouge',es:'el color rojo',de:'die Farbe Rot'},'blue sky':{fr:'ciel bleu',es:'cielo azul',de:'blauer Himmel'},
    'green tea':{fr:'thé vert',es:'té verde',de:'grüner Tee'},'the color yellow':{fr:'la couleur jaune',es:'el color amarillo',de:'die Farbe Gelb'},
    'the color white':{fr:'la couleur blanche',es:'el color blanco',de:'die Farbe Weiß'},'dark night':{fr:'nuit noire',es:'noche oscura',de:'dunkle Nacht'},
    'a greeting':{fr:'une salutation',es:'un saludo',de:'ein Gruß'},'words of thanks':{fr:'des remerciements',es:'palabras de gracias',de:'Dankesworte'},
    'a farewell':{fr:'un adieu',es:'una despedida',de:'ein Abschied'},'agreement':{fr:'accord',es:'acuerdo',de:'Zustimmung'},'refusal':{fr:'refus',es:'negación',de:'Ablehnung'},
  };
  // Portuguese + Chinese meanings (merged into MEANINGS at boot; ar/hi next)
  const MEANINGS2 = {
    'hello':{pt:'olá',zh:'你好'},'thank you':{pt:'obrigado',zh:'谢谢'},'goodbye':{pt:'tchau',zh:'再见'},
    'please':{pt:'por favor',zh:'请'},'sorry':{pt:'desculpa',zh:'对不起'},'yes':{pt:'sim',zh:'是'},'no':{pt:'não',zh:'不'},
    'one':{pt:'um',zh:'一'},'two':{pt:'dois',zh:'二'},'three':{pt:'três',zh:'三'},'four':{pt:'quatro',zh:'四'},
    'five':{pt:'cinco',zh:'五'},'six':{pt:'seis',zh:'六'},'seven':{pt:'sete',zh:'七'},'eight':{pt:'oito',zh:'八'},
    'nine':{pt:'nove',zh:'九'},'ten':{pt:'dez',zh:'十'},'hundred':{pt:'cem',zh:'百'},'thousand':{pt:'mil',zh:'千'},
    'ten thousand':{pt:'dez mil',zh:'万'},'zero':{pt:'zero',zh:'零'},'two (of)':{pt:'dois (de)',zh:'两'},
    'I / me':{pt:'eu',zh:'我'},'you':{pt:'você',zh:'你'},'he':{pt:'ele',zh:'他'},'she':{pt:'ela',zh:'她'},
    'we / us':{pt:'nós',zh:'我们'},'to be / yes':{pt:'ser / sim',zh:'是'},'not / no':{pt:'não',zh:'不'},
    'good':{pt:'bom',zh:'好'},'correct':{pt:'correto',zh:'对'},'also':{pt:'também',zh:'也'},
    'today':{pt:'hoje',zh:'今天'},'tomorrow':{pt:'amanhã',zh:'明天'},'yesterday':{pt:'ontem',zh:'昨天'},
    'day / sky':{pt:'dia / céu',zh:'天'},'now':{pt:'agora',zh:'现在'},'year':{pt:'ano',zh:'年'},
    'month / moon':{pt:'mês / lua',zh:'月'},'day / sun':{pt:'dia / sol',zh:'日'},'week':{pt:'semana',zh:'星期'},
    'o’clock':{pt:'hora',zh:'点'},'mom':{pt:'mãe',zh:'妈妈'},'dad':{pt:'pai',zh:'爸爸'},
    'older brother':{pt:'irmão mais velho',zh:'哥哥'},'older sister':{pt:'irmã mais velha',zh:'姐姐'},
    'home / family':{pt:'casa / família',zh:'家'},'person':{pt:'pessoa',zh:'人'},'friend':{pt:'amigo',zh:'朋友'},
    'teacher':{pt:'professor',zh:'老师'},'student':{pt:'estudante',zh:'学生'},'name':{pt:'nome',zh:'名字'},
    'sun':{pt:'sol',zh:'太阳'},'moon':{pt:'lua',zh:'月亮'},'star':{pt:'estrela',zh:'星星'},'cloud':{pt:'nuvem',zh:'云'},
    'wind':{pt:'vento',zh:'风'},'water':{pt:'água',zh:'水'},'fire':{pt:'fogo',zh:'火'},'mountain':{pt:'montanha',zh:'山'},
    'tree':{pt:'árvore',zh:'树'},'rain':{pt:'chuva',zh:'雨'},'flower':{pt:'flor',zh:'花'},'sea':{pt:'mar',zh:'海'},
    'stone':{pt:'pedra',zh:'石头'},'soil / earth':{pt:'terra',zh:'土'},'grass':{pt:'grama',zh:'草'},
    'cat':{pt:'gato',zh:'猫'},'dog':{pt:'cachorro',zh:'狗'},'bird':{pt:'pássaro',zh:'鸟'},'fish':{pt:'peixe',zh:'鱼'},
    'rabbit':{pt:'coelho',zh:'兔子'},'horse':{pt:'cavalo',zh:'马'},'panda':{pt:'panda',zh:'熊猫'},
    'tiger':{pt:'tigre',zh:'老虎'},'chicken':{pt:'galinha',zh:'鸡'},'dragon':{pt:'dragão',zh:'龙'},
    'to eat':{pt:'comer',zh:'吃'},'to drink':{pt:'beber',zh:'喝'},'rice':{pt:'arroz',zh:'米饭'},'tea':{pt:'chá',zh:'茶'},
    'bread':{pt:'pão',zh:'面包'},'tasty':{pt:'gostoso',zh:'好吃'},'apple':{pt:'maçã',zh:'苹果'},'meat':{pt:'carne',zh:'肉'},
    'dish / vegetable':{pt:'prato / legume',zh:'菜'},'egg':{pt:'ovo',zh:'蛋'},'to go':{pt:'ir',zh:'去'},
    'to come':{pt:'vir',zh:'来'},'to walk / leave':{pt:'andar / sair',zh:'走'},'to run':{pt:'correr',zh:'跑'},
    'to sit':{pt:'sentar',zh:'坐'},'to look / read':{pt:'olhar / ler',zh:'看'},'to speak':{pt:'falar',zh:'说'},
    'to listen':{pt:'ouvir',zh:'听'},'to want / miss':{pt:'querer / sentir falta',zh:'想'},'to know':{pt:'saber',zh:'知道'},
    'to love':{pt:'amar',zh:'爱'},'to learn':{pt:'aprender',zh:'学'},'to like':{pt:'gostar',zh:'喜欢'},
    'to have':{pt:'ter',zh:'有'},'to do / make':{pt:'fazer',zh:'做'},'to see':{pt:'ver',zh:'看见'},
    'to want / love':{pt:'querer',zh:'要 / 爱'},'red':{pt:'vermelho',zh:'红'},'blue':{pt:'azul',zh:'蓝'},
    'green':{pt:'verde',zh:'绿'},'yellow':{pt:'amarelo',zh:'黄'},'white':{pt:'branco',zh:'白'},'black':{pt:'preto',zh:'黑'},
    'color':{pt:'cor',zh:'颜色'},'big':{pt:'grande',zh:'大'},'small':{pt:'pequeno',zh:'小'},'many':{pt:'muitos',zh:'多'},
    'few':{pt:'poucos',zh:'少'},'tall / high':{pt:'alto',zh:'高'},'hot':{pt:'quente',zh:'热'},'cold':{pt:'frio',zh:'冷'},
    'new':{pt:'novo',zh:'新'},'fast':{pt:'rápido',zh:'快'},'pretty':{pt:'bonito',zh:'漂亮'},
    'mother':{pt:'mãe',zh:'母亲'},'father':{pt:'pai',zh:'父亲'},'brother':{pt:'irmão',zh:'兄弟'},'sister':{pt:'irmã',zh:'姐妹'},
    'cheese':{pt:'queijo',zh:'奶酪'},'coffee':{pt:'café',zh:'咖啡'},
    'the color red':{pt:'a cor vermelha',zh:'红色'},'blue sky':{pt:'céu azul',zh:'蓝天'},'green tea':{pt:'chá verde',zh:'绿茶'},
    'the color yellow':{pt:'a cor amarela',zh:'黄色'},'the color white':{pt:'a cor branca',zh:'白色'},
    'dark night':{pt:'noite escura',zh:'黑夜'},'a greeting':{pt:'uma saudação',zh:'问候语'},
    'words of thanks':{pt:'palavras de agradecimento',zh:'感谢语'},'a farewell':{pt:'uma despedida',zh:'告别语'},
    'agreement':{pt:'concordância',zh:'同意'},'refusal':{pt:'recusa',zh:'拒绝'},
    'house':{pt:'casa',zh:'房子'},'school':{pt:'escola',zh:'学校'},'city':{pt:'cidade',zh:'城市'},
    'beach':{pt:'praia',zh:'海滩'},'market':{pt:'mercado',zh:'市场'},'shop':{pt:'loja',zh:'商店'},'park':{pt:'parque',zh:'公园'},'hospital':{pt:'hospital',zh:'医院'},'what':{pt:'o quê',zh:'什么'},'who':{pt:'quem',zh:'谁'},'where':{pt:'onde',zh:'哪里'},'why':{pt:'por quê',zh:'为什么'},'how':{pt:'como',zh:'怎么'},
    'hand':{pt:'mão',zh:'手'},'head':{pt:'cabeça',zh:'头'},'eyes':{pt:'olhos',zh:'眼睛'},'ears':{pt:'orelhas',zh:'耳朵'},
    'mouth':{pt:'boca',zh:'嘴'},'clothes':{pt:'roupa',zh:'衣服'},'shoes':{pt:'sapatos',zh:'鞋'},'hat':{pt:'chapéu',zh:'帽子'},
    'pants':{pt:'calças',zh:'裤子'},'to wear':{pt:'vestir',zh:'穿'},'weather':{pt:'tempo',zh:'天气'},'sunny':{pt:'ensolarado',zh:'晴'},
    'snow':{pt:'neve',zh:'雪'},'overcast':{pt:'nublado',zh:'阴'},'windy':{pt:'ventoso',zh:'刮风'},'happy':{pt:'feliz',zh:'高兴'},
    'tired':{pt:'cansado',zh:'累'},'hungry':{pt:'com fome',zh:'饿'},'thirsty':{pt:'com sede',zh:'渴'},'busy':{pt:'ocupado',zh:'忙'},
    'book':{pt:'livro',zh:'书'},'pen':{pt:'caneta',zh:'笔'},'desk':{pt:'mesa',zh:'桌子'},'chair':{pt:'cadeira',zh:'椅子'},'computer':{pt:'computador',zh:'电脑'},
    'car':{pt:'carro',zh:'车'},'train':{pt:'trem',zh:'火车'},'airplane':{pt:'avião',zh:'飞机'},'bus':{pt:'ônibus',zh:'公共汽车'},
    'bicycle':{pt:'bicicleta',zh:'自行车'},'to buy':{pt:'comprar',zh:'买'},'to sleep':{pt:'dormir',zh:'睡觉'},
    'to get up':{pt:'levantar-se',zh:'起床'},'to work':{pt:'trabalhar',zh:'工作'},'to play':{pt:'brincar',zh:'玩'},
    'to ask':{pt:'perguntar',zh:'问'},'to write':{pt:'escrever',zh:'写'},'to help':{pt:'ajudar',zh:'帮助'},
    'to give':{pt:'dar',zh:'给'},'to make a phone call':{pt:'telefonar',zh:'打电话'},
  };
  Object.entries(MEANINGS2).forEach(([k, v]) => Object.assign(MEANINGS[k] = MEANINGS[k] || {}, v));
  // Arabic + Hindi meanings (last two base languages)
  const MEANINGS3 = {
    'hello':{ar:'مرحبا',hi:'नमस्ते'},'thank you':{ar:'شكرا',hi:'धन्यवाद'},'goodbye':{ar:'مع السلامة',hi:'अलविदा'},
    'please':{ar:'من فضلك',hi:'कृपया'},'sorry':{ar:'آسف',hi:'माफ़ कीजिए'},'yes':{ar:'نعم',hi:'हाँ'},'no':{ar:'لا',hi:'नहीं'},
    'one':{ar:'واحد',hi:'एक'},'two':{ar:'اثنان',hi:'दो'},'three':{ar:'ثلاثة',hi:'तीन'},'four':{ar:'أربعة',hi:'चार'},
    'five':{ar:'خمسة',hi:'पाँच'},'six':{ar:'ستة',hi:'छह'},'seven':{ar:'سبعة',hi:'सात'},'eight':{ar:'ثمانية',hi:'आठ'},
    'nine':{ar:'تسعة',hi:'नौ'},'ten':{ar:'عشرة',hi:'दस'},'hundred':{ar:'مئة',hi:'सौ'},'thousand':{ar:'ألف',hi:'हज़ार'},
    'zero':{ar:'صفر',hi:'शून्य'},'I / me':{ar:'أنا',hi:'मैं'},'you':{ar:'أنت',hi:'तुम'},'he':{ar:'هو',hi:'वह'},
    'she':{ar:'هي',hi:'वह'},'we / us':{ar:'نحن',hi:'हम'},'good':{ar:'جيد',hi:'अच्छा'},'correct':{ar:'صحيح',hi:'सही'},
    'also':{ar:'أيضا',hi:'भी'},'today':{ar:'اليوم',hi:'आज'},'tomorrow':{ar:'غدا',hi:'कल (आने वाला)'},
    'yesterday':{ar:'أمس',hi:'कल (बीता)'},'now':{ar:'الآن',hi:'अभी'},'year':{ar:'سنة',hi:'साल'},'week':{ar:'أسبوع',hi:'सप्ताह'},
    'mom':{ar:'ماما',hi:'माँ'},'dad':{ar:'بابا',hi:'पिताजी'},'home / family':{ar:'بيت / عائلة',hi:'घर / परिवार'},
    'person':{ar:'شخص',hi:'व्यक्ति'},'friend':{ar:'صديق',hi:'दोस्त'},'teacher':{ar:'معلم',hi:'शिक्षक'},
    'student':{ar:'طالب',hi:'छात्र'},'name':{ar:'اسم',hi:'नाम'},'sun':{ar:'شمس',hi:'सूरज'},'moon':{ar:'قمر',hi:'चाँद'},
    'star':{ar:'نجمة',hi:'तारा'},'cloud':{ar:'سحابة',hi:'बादल'},'wind':{ar:'ريح',hi:'हवा'},'water':{ar:'ماء',hi:'पानी'},
    'fire':{ar:'نار',hi:'आग'},'mountain':{ar:'جبل',hi:'पहाड़'},'tree':{ar:'شجرة',hi:'पेड़'},'rain':{ar:'مطر',hi:'बारिश'},
    'flower':{ar:'زهرة',hi:'फूल'},'sea':{ar:'بحر',hi:'समुद्र'},'stone':{ar:'حجر',hi:'पत्थर'},'grass':{ar:'عشب',hi:'घास'},
    'cat':{ar:'قطة',hi:'बिल्ली'},'dog':{ar:'كلب',hi:'कुत्ता'},'bird':{ar:'طائر',hi:'चिड़िया'},'fish':{ar:'سمكة',hi:'मछली'},
    'rabbit':{ar:'أرنب',hi:'खरगोश'},'horse':{ar:'حصان',hi:'घोड़ा'},'panda':{ar:'باندا',hi:'पांडा'},'tiger':{ar:'نمر',hi:'बाघ'},
    'chicken':{ar:'دجاجة',hi:'मुर्गी'},'dragon':{ar:'تنين',hi:'ड्रैगन'},'to eat':{ar:'يأكل',hi:'खाना'},
    'to drink':{ar:'يشرب',hi:'पीना'},'rice':{ar:'أرز',hi:'चावल'},'tea':{ar:'شاي',hi:'चाय'},'bread':{ar:'خبز',hi:'रोटी'},
    'tasty':{ar:'لذيذ',hi:'स्वादिष्ट'},'apple':{ar:'تفاحة',hi:'सेब'},'meat':{ar:'لحم',hi:'मांस'},'egg':{ar:'بيضة',hi:'अंडा'},
    'to go':{ar:'يذهب',hi:'जाना'},'to come':{ar:'يأتي',hi:'आना'},'to run':{ar:'يجري',hi:'दौड़ना'},'to sit':{ar:'يجلس',hi:'बैठना'},
    'to speak':{ar:'يتكلم',hi:'बोलना'},'to listen':{ar:'يستمع',hi:'सुनना'},'to know':{ar:'يعرف',hi:'जानना'},
    'to love':{ar:'يحب',hi:'प्यार करना'},'to learn':{ar:'يتعلم',hi:'सीखना'},'to like':{ar:'يعجب',hi:'पसंद करना'},
    'to have':{ar:'يملك',hi:'रखना'},'to see':{ar:'يرى',hi:'देखना'},'red':{ar:'أحمر',hi:'लाल'},'blue':{ar:'أزرق',hi:'नीला'},
    'green':{ar:'أخضر',hi:'हरा'},'yellow':{ar:'أصفر',hi:'पीला'},'white':{ar:'أبيض',hi:'सफ़ेद'},'black':{ar:'أسود',hi:'काला'},
    'color':{ar:'لون',hi:'रंग'},'big':{ar:'كبير',hi:'बड़ा'},'small':{ar:'صغير',hi:'छोटा'},'many':{ar:'كثير',hi:'बहुत'},
    'few':{ar:'قليل',hi:'कम'},'hot':{ar:'حار',hi:'गर्म'},'cold':{ar:'بارد',hi:'ठंडा'},'new':{ar:'جديد',hi:'नया'},
    'fast':{ar:'سريع',hi:'तेज़'},'pretty':{ar:'جميل',hi:'सुंदर'},'mother':{ar:'أم',hi:'माता'},'father':{ar:'أب',hi:'पिता'},
    'brother':{ar:'أخ',hi:'भाई'},'sister':{ar:'أخت',hi:'बहन'},'cheese':{ar:'جبن',hi:'पनीर'},'coffee':{ar:'قهوة',hi:'कॉफ़ी'},
    'house':{ar:'بيت',hi:'घर'},'school':{ar:'مدرسة',hi:'स्कूल'},'city':{ar:'مدينة',hi:'शहर'},'beach':{ar:'شاطئ',hi:'समुद्र तट'},
    'market':{ar:'سوق',hi:'बाज़ार'},'shop':{ar:'متجر',hi:'दुकान'},'park':{ar:'حديقة',hi:'पार्क'},'hospital':{ar:'مستشفى',hi:'अस्पताल'},
    'what':{ar:'ماذا',hi:'क्या'},'who':{ar:'من',hi:'कौन'},'where':{ar:'أين',hi:'कहाँ'},'why':{ar:'لماذا',hi:'क्यों'},'how':{ar:'كيف',hi:'कैसे'},
    'hand':{ar:'يد',hi:'हाथ'},'head':{ar:'رأس',hi:'सिर'},'eyes':{ar:'عيون',hi:'आँखें'},'ears':{ar:'آذان',hi:'कान'},
    'mouth':{ar:'فم',hi:'मुँह'},'clothes':{ar:'ملابس',hi:'कपड़े'},'shoes':{ar:'أحذية',hi:'जूते'},'hat':{ar:'قبعة',hi:'टोपी'},
    'pants':{ar:'بنطال',hi:'पैंट'},'to wear':{ar:'يرتدي',hi:'पहनना'},'weather':{ar:'طقس',hi:'मौसम'},'sunny':{ar:'مشمس',hi:'धूप वाला'},
    'snow':{ar:'ثلج',hi:'बर्फ़'},'overcast':{ar:'غائم',hi:'बादल छाए'},'windy':{ar:'عاصف',hi:'हवादार'},'happy':{ar:'سعيد',hi:'खुश'},
    'tired':{ar:'متعب',hi:'थका हुआ'},'hungry':{ar:'جائع',hi:'भूखा'},'thirsty':{ar:'عطشان',hi:'प्यासा'},'busy':{ar:'مشغول',hi:'व्यस्त'},
    'book':{ar:'كتاب',hi:'किताब'},'pen':{ar:'قلم',hi:'क़लम'},'desk':{ar:'مكتب',hi:'मेज़'},'chair':{ar:'كرسي',hi:'कुर्सी'},'computer':{ar:'حاسوب',hi:'कंप्यूटर'},
    'car':{ar:'سيارة',hi:'गाड़ी'},'train':{ar:'قطار',hi:'रेलगाड़ी'},'airplane':{ar:'طائرة',hi:'हवाई जहाज़'},
    'bus':{ar:'حافلة',hi:'बस'},'bicycle':{ar:'دراجة',hi:'साइकिल'},'to buy':{ar:'يشتري',hi:'खरीदना'},
    'to sleep':{ar:'ينام',hi:'सोना'},'to get up':{ar:'يستيقظ',hi:'उठना'},'to work':{ar:'يعمل',hi:'काम करना'},
    'to play':{ar:'يلعب',hi:'खेलना'},'to ask':{ar:'يسأل',hi:'पूछना'},'to write':{ar:'يكتب',hi:'लिखना'},
    'to help':{ar:'يساعد',hi:'मदद करना'},'to give':{ar:'يعطي',hi:'देना'},'to make a phone call':{ar:'يتصل هاتفيا',hi:'फ़ोन करना'},
  };
  Object.entries(MEANINGS3).forEach(([k, v]) => Object.assign(MEANINGS[k] = MEANINGS[k] || {}, v));

  const tm = en => { if (S.uiLang === 'en' || !en) return en; const m = MEANINGS[en]; return (m && m[S.uiLang]) || en; };
  function applyUiLang() {
    document.querySelectorAll('.tab').forEach(b => {
      const s = b.querySelector('small'); if (!s) return;
      const id = b.dataset.id === 'battle' ? 'arena' : b.dataset.id;
      s.textContent = tr('nav_' + id);
    });
    document.documentElement.dir = ['ar', 'he', 'ur'].includes(S.uiLang) ? 'rtl' : 'ltr';
  }

  // Smarter, harder distractors: prefer same UNIT (so numbers vs numbers),
  // then same realm/theme, then anything. Avoids "1 vs chicken" mismatches.
  function distractors(term, n) {
    const all = allTerms(term.courseId).filter(p => p.id !== term.id && p.en !== term.en);
    const buckets = [
      all.filter(p => p.unitIndex === term.unitIndex),
      all.filter(p => p.realm === term.realm),
      all,
    ];
    const picked = [], seen = new Set([term.en]);
    for (const pool of buckets) {
      for (const p of shuffle(pool)) { if (picked.length >= n) break; if (!seen.has(p.en)) { picked.push(p); seen.add(p.en); } }
      if (picked.length >= n) break;
    }
    return picked.slice(0, n);
  }
  // Difficulty scales smoothly across a ladder of any length (5 or 12 bosses).
  // Balanced so PERFECT play always wins: you take only a small "chip" on each
  // correct answer and a big hit on each miss. Player HP 100, power 40.
  const BATTLE_POWER = 40;
  function tierFor(i, total) {
    const t = total <= 1 ? 0 : i / (total - 1);          // 0 → 1
    const hitsToWin = 5 + Math.round(t * 7);             // 5 (first) → 12 (last) correct answers — harder
    return {
      label: t < 0.34 ? 'Easy' : t < 0.67 ? 'Medium' : 'Hard',
      hitsToWin,
      chip: Math.round(2 + t * 4),                        // dmg per CORRECT (2 → 6): 11*6=66 < 100, perfect play still wins ✓
      big:  Math.round(12 + t * 14),                      // dmg per MISS (12 → 26) — mistakes punished harder
      opts: t < 0.34 ? 3 : 4,
    };
  }

  /* ---------------- State ---------------- */
  const SAVE = 'wordwisp.v2';
  const fresh = () => ({
    courseId: 'zh', xp: 0, xpWeek: 0, gems: 50, streak: 0, lanterns: 5, lanternsMax: 5,
    lastDay: '', done: {}, owned: {}, beaten: {}, league: null, friends: null, tourney: null,
    studyDeck: 'collected', studyFront: 'char', studyMode: 'fixed', ttsKey: '', uiLang: 'en', sound: true, misses: {}, quest: null, freeze: 0, wins: 0,
    displayName: '', myId: '',
  });
  let S = (() => { try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(SAVE))); } catch { return fresh(); } })();
  const persist = () => localStorage.setItem(SAVE, JSON.stringify(S));
  const course = () => COURSES[S.courseId];
  const today = () => new Date().toISOString().slice(0, 10);
  const beatenSet = () => (S.beaten[S.courseId] || (S.beaten[S.courseId] = {}));   // per-language!
  const readingWord = c => c.id === 'zh' ? 'pinyin' : c.id === 'ja' ? 'rōmaji' : 'reading';

  /* ---------------- Speech (clearer, more natural) ---------------- */
  const VOICE_PREF = {
    zh: ['Tingting', 'Ting-Ting', 'Mei-Jia', 'Sin-ji', 'Google 普通话（中国大陆）', 'Google 普通话', 'Microsoft Xiaoxiao', 'Microsoft Yunxi'],
    es: ['Mónica', 'Monica', 'Paulina', 'Google español', 'Microsoft Elvira', 'Microsoft Helena'],
    fr: ['Amélie', 'Amelie', 'Thomas', 'Audrey', 'Google français', 'Microsoft Denise'],
    de: ['Anna', 'Petra', 'Markus', 'Google Deutsch', 'Microsoft Katja'],
    it: ['Alice', 'Luca', 'Google italiano', 'Microsoft Elsa'],
    pt: ['Luciana', 'Joana', 'Google português do Brasil', 'Google português', 'Microsoft Francisca'],
    ja: ['Kyoko', 'Otoya', 'Google 日本語', 'Microsoft Nanami'],
    ko: ['Yuna', 'Sora', 'Google 한국의', 'Microsoft SunHi'],
    ar: ['Majed', 'Tarik', 'Google العربية', 'Microsoft Hamed'],
    he: ['Carmit', 'Google עברית'],
    hi: ['Lekha', 'Google हिन्दी', 'Microsoft Swara'],
    tr: ['Yelda', 'Google Türkçe', 'Microsoft Emel'],
    bn: ['Google বাংলা'], ur: ['Google اردو'], sw: ['Google Kiswahili'],
  };
  let _voices = [];
  function refreshVoices() { _voices = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : []; }
  if ('speechSynthesis' in window) { refreshVoices(); speechSynthesis.onvoiceschanged = refreshVoices; }
  function pickVoice(lang) {
    if (!_voices.length) refreshVoices();
    const want = lang.toLowerCase().replace('_', '-');
    const base = want.slice(0, 2);
    const pool = _voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(base));
    if (!pool.length) return null;                                   // no voice for this language installed
    const named = n => pool.find(v => v.name && v.name.toLowerCase().includes(n.toLowerCase()));
    for (const n of (VOICE_PREF[base] || [])) { const m = named(n); if (m) return m; }
    const exact = pool.filter(v => v.lang.toLowerCase().replace('_', '-') === want);
    const quality = v => /enhanced|premium|neural|natural|siri/i.test(v.name);
    return exact.find(quality) || pool.find(quality) || exact.find(v => v.localService) || pool.find(v => v.localService) || exact[0] || pool[0];
  }
  function browserSpeak(text, lang) {
    if (!('speechSynthesis' in window) || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || course().tts;
    const v = pickVoice(u.lang); if (v) u.voice = v;
    u.rate = 0.8; u.pitch = 1.0; u.volume = 1;   // clear + steady
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }

  /* ---- Cloud TTS (Google) — perfect, consistent pronunciation in every language.
     Enable by pasting a Google Cloud Text-to-Speech API key in Profile → Voice. ---- */
  // Google voice per course: { lc: Google languageCode, name: a good Wavenet/Neural2 voice }.
  const GTTS = {
    zh: { lc: 'cmn-CN', name: 'cmn-CN-Wavenet-A' }, es: { lc: 'es-ES', name: 'es-ES-Neural2-A' },
    fr: { lc: 'fr-FR', name: 'fr-FR-Neural2-A' }, de: { lc: 'de-DE', name: 'de-DE-Neural2-A' },
    it: { lc: 'it-IT', name: 'it-IT-Neural2-A' }, pt: { lc: 'pt-BR', name: 'pt-BR-Neural2-A' },
    en: { lc: 'en-US', name: 'en-US-Neural2-A' }, ja: { lc: 'ja-JP', name: 'ja-JP-Neural2-B' },
    ko: { lc: 'ko-KR', name: 'ko-KR-Neural2-A' }, ar: { lc: 'ar-XA', name: 'ar-XA-Wavenet-A' },
    tr: { lc: 'tr-TR', name: 'tr-TR-Wavenet-A' }, he: { lc: 'he-IL', name: 'he-IL-Wavenet-A' },
    hi: { lc: 'hi-IN', name: 'hi-IN-Neural2-A' }, ur: { lc: 'ur-IN', name: 'ur-IN-Wavenet-A' },
    bn: { lc: 'bn-IN', name: 'bn-IN-Wavenet-A' }, sw: { lc: 'sw-KE', name: 'sw-KE-Standard-A' },
    zu: { lc: 'zu-ZA', name: 'zu-ZA-Standard-A' }, yo: { lc: 'yo-NG', name: 'yo-NG-Standard-A' },
    ru: { lc: 'ru-RU', name: 'ru-RU-Wavenet-A' }, pl: { lc: 'pl-PL', name: 'pl-PL-Wavenet-A' },
    nl: { lc: 'nl-NL', name: 'nl-NL-Wavenet-A' }, el: { lc: 'el-GR', name: 'el-GR-Wavenet-A' },
    vi: { lc: 'vi-VN', name: 'vi-VN-Wavenet-A' }, id: { lc: 'id-ID', name: 'id-ID-Wavenet-A' },
    th: { lc: 'th-TH', name: 'th-TH-Standard-A' }, tl: { lc: 'fil-PH', name: 'fil-PH-Wavenet-A' },
  };
  const ttsCache = {};
  let _audio = null;
  function playAudio(src) { try { if (_audio) _audio.pause(); _audio = new Audio(src); _audio.play().catch(() => {}); } catch {} }
  async function speakCloud(text) {
    const key = S.ttsKey, g = GTTS[S.courseId];
    if (!key || !g) throw new Error('no cloud tts');
    const ck = S.courseId + '|' + text;
    if (ttsCache[ck]) return playAudio(ttsCache[ck]);
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(key), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: g.lc, name: g.name }, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 } }),
    });
    if (!res.ok) throw new Error('tts http ' + res.status);
    const data = await res.json();
    const src = 'data:audio/mp3;base64,' + data.audioContent;
    ttsCache[ck] = src; playAudio(src);
  }
  function speak(text, lang) {
    if (!text) return;
    if (S.ttsKey && GTTS[S.courseId]) { speakCloud(text).catch(() => browserSpeak(text, lang)); return; }
    browserSpeak(text, lang);
  }

  /* ---- Cloud (Supabase): real accounts, global leaderboard, server matches ---- */
  const SB_URL = 'https://rdnkyqzfxnuecnuqerfq.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbmt5cXpmeG51ZWNudXFlcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTU1NjAsImV4cCI6MjA5OTI5MTU2MH0.4rfBYg2lraPAJnSZ79s0Q8KQKilPU2nw2aHnvBnkMEQ';
  const CLOUD = { session: null, err: null };
  const sbH = tok => ({ apikey: SB_KEY, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (tok || SB_KEY) });
  const sbUid = () => (CLOUD.session && CLOUD.session.user && CLOUD.session.user.id) || null;
  async function sbAuth() {
    try { CLOUD.session = JSON.parse(localStorage.getItem('ww.sb') || 'null'); } catch { CLOUD.session = null; }
    if (CLOUD.session && CLOUD.session.refresh_token) {
      try {
        const r = await fetch(SB_URL + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: sbH(), body: JSON.stringify({ refresh_token: CLOUD.session.refresh_token }) });
        if (r.ok) { CLOUD.session = await r.json(); localStorage.setItem('ww.sb', JSON.stringify(CLOUD.session)); return true; }
      } catch {}
      CLOUD.session = null;
    }
    try {
      const r = await fetch(SB_URL + '/auth/v1/signup', { method: 'POST', headers: sbH(), body: JSON.stringify({ data: {} }) });
      const j = await r.json();
      if (r.ok && j.access_token) { CLOUD.session = j; localStorage.setItem('ww.sb', JSON.stringify(j)); CLOUD.err = null; return true; }
      CLOUD.err = j.error_code || j.msg || 'auth failed';
    } catch { CLOUD.err = 'offline'; }
    return false;
  }
  function sbSync() {   // profile upsert; returns the promise so callers can await it
    if (!sbUid()) return Promise.resolve();
    return fetch(SB_URL + '/rest/v1/profiles', { method: 'POST',
      headers: { ...sbH(CLOUD.session.access_token), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: sbUid(), name: S.displayName || 'Learner', xp: S.xp, xp_week: S.xpWeek, course: S.courseId, updated_at: new Date().toISOString() }) }).catch(() => {});
  }
  async function sbLeaderboard() {
    try { const r = await fetch(SB_URL + '/rest/v1/profiles?select=name,xp_week,course&order=xp_week.desc&limit=10', { headers: sbH(CLOUD.session && CLOUD.session.access_token) });
      return r.ok ? await r.json() : []; } catch { return []; }
  }
  async function sbCreateMatch(termIds, score, guest) {
    try { await sbSync();   // matches.host has a FK to profiles — ensure ours exists
      const r = await fetch(SB_URL + '/rest/v1/matches', { method: 'POST',
      headers: { ...sbH(CLOUD.session.access_token), Prefer: 'return=representation' },
      body: JSON.stringify({ host: sbUid(), course: S.courseId, term_ids: termIds, host_score: score, ...(guest ? { guest } : {}) }) });
      const j = await r.json(); return (r.ok && j[0]) ? j[0].id : null; } catch { return null; }
  }
  async function sbAnswerMatch(id, score) {
    if (!sbUid() || !id) return;
    await sbSync();         // matches.guest has a FK to profiles too
    fetch(SB_URL + '/rest/v1/matches?id=eq.' + encodeURIComponent(id), { method: 'PATCH',
      headers: sbH(CLOUD.session.access_token), body: JSON.stringify({ guest: sbUid(), guest_score: score }) }).catch(() => {});
  }

  /* ---- tiny sound effects (Web Audio, no assets) + haptics ---- */
  let _ac = null;
  function sfx(kind) {
    if (S.sound === false) return;
    try {
      _ac = _ac || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = _ac.currentTime;
      const tone = (f, st, d, type, g) => { const o = _ac.createOscillator(), v = _ac.createGain(); o.type = type || 'sine'; o.frequency.value = f; v.gain.setValueAtTime(g || .1, t0 + st); v.gain.exponentialRampToValueAtTime(.001, t0 + st + d); o.connect(v); v.connect(_ac.destination); o.start(t0 + st); o.stop(t0 + st + d); };
      if (kind === 'good') { tone(660, 0, .12); tone(880, .09, .16); }
      else if (kind === 'bad') { tone(220, 0, .18, 'square', .07); tone(170, .11, .22, 'square', .07); }
      else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, .2)); }
    } catch {}
  }
  function buzz(ok) { try { if (navigator.vibrate) navigator.vibrate(ok ? 12 : [25, 40, 25]); } catch {} }

  /* ---------------- Theme (per language) ---------------- */
  function applyTheme() {
    const c = course(), root = document.documentElement.style;
    root.setProperty('--jade', c.accent); root.setProperty('--jade-d', c.accentD || c.accent);
  }

  /* ---------------- Top bar ---------------- */
  function renderTop() {
    const c = course();
    $('#lang-btn').innerHTML = `${c.flag} <span>${c.native}</span> ▾`;
    $('#s-fire').textContent = S.streak;
    $('#s-gem').textContent = S.gems;
    $('#s-life-ic').textContent = c.lives ? c.lives.icon : '🏮';
    $('#s-life').textContent = S.lanterns;
    $('#s-xp').textContent = S.xp;
  }
  const lifeIcon = () => (course().lives ? course().lives.icon : '🏮');

  /* ---------------- Router ---------------- */
  const TABS = ['learn', 'study', 'cards', 'battle', 'me'];
  function go(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.id === name));
    TABS.forEach(s => $('#scr-' + s).classList.toggle('active', s === name));
    if (name === 'learn') renderLearn();
    if (name === 'study') renderStudy();
    if (name === 'cards') renderCollection();
    if (name === 'battle') renderArena();
    if (name === 'me') renderProfile();
    window.scrollTo({ top: 0 });
  }

  /* ---------------- LEARN: path ---------------- */
  function lessonState(lesson) {
    if (S.done[lesson.id]) return 'done';
    const flat = []; course().units.forEach(u => u.lessons.forEach(l => flat.push(l)));
    const firstUndone = flat.find(l => !S.done[l.id]);
    return firstUndone && firstUndone.id === lesson.id ? 'current' : 'locked';
  }
  function renderLearn() {
    const c = course(); const root = $('#scr-learn'); root.innerHTML = '';
    root.appendChild(el('div', 'brand-hero', `<div class="wlogo">${CROW} ${BRAND}</div><div class="wsub">${TAGLINE}</div>`));
    root.appendChild(el('div', 'mascot-row', `<div class="mascot">${c.mascot}</div>`));
    if (Object.keys(S.done).filter(k => k.startsWith(c.id)).length < 3) {
      root.appendChild(el('div', 'placement-banner', `<div><b>${tl('New to')} ${esc(c.name)}?</b><div class="note" style="margin-top:2px">${tl('Take a 1-minute placement test to skip ahead.')}</div></div><button class="btn sm" data-action="start-placement">${tl('Test me')}</button>`));
    }
    // daily quest — rotates: earn XP / finish lessons / win a battle → +10 gems
    if (!S.quest || S.quest.day !== today()) {
      const qtype = ['xp', 'lessons', 'battle'][Math.floor(Date.parse(today()) / 864e5) % 3];
      S.quest = { day: today(), type: qtype, xp0: S.xp, l0: Object.keys(S.done).length, w0: S.wins || 0, claimed: false }; persist();
    }
    const qq = S.quest, qGoal = qq.type === 'xp' ? 20 : qq.type === 'lessons' ? 2 : 1;
    const qProg = Math.min(qGoal, qq.type === 'xp' ? S.xp - qq.xp0 : qq.type === 'lessons' ? Object.keys(S.done).length - qq.l0 : (S.wins || 0) - qq.w0);
    const qLabel = qq.type === 'xp' ? tl('Daily quest: earn 20 XP') : qq.type === 'lessons' ? tl('Daily quest: finish 2 new lessons') : tl('Daily quest: win a battle');
    root.appendChild(el('div', 'quest-card', `<div style="flex:1"><b>🎯 ${qLabel}</b>
      <div class="qbar"><i style="width:${Math.round(100 * qProg / qGoal)}%"></i></div></div>
      ${qProg >= qGoal && !qq.claimed ? `<button class="btn sm gold" data-action="quest-claim">${tl('Claim')} +10 💎</button>`
        : (qq.claimed ? '<span class="note">✅</span>' : `<span class="note" style="white-space:nowrap">${qProg}/${qGoal}</span>`)}`));
    c.units.forEach((u, ui) => {
      const head = el('div', 'unit-head'); head.style.background = u.color;
      // If the unit title is written in a non-Latin script, show a readable
      // header in the app language instead (so learners can always read it).
      const nonLatin = /[֐-￿]/.test(u.title);
      const parts = u.title.split('·');
      const line1 = `${tr('unit')} ${ui + 1}`;
      const line2 = tl(nonLatin ? ((u.lessons[0] && u.lessons[0].title) || '') : (parts[1] || '').trim());
      head.innerHTML = `<div><div class="ut">${esc(line1)}</div><div class="un">${esc(line2)}</div></div><div class="book">📖</div>`;
      root.appendChild(head);
      const path = el('div', 'path');
      u.lessons.forEach(l => {
        const st = lessonState(l);
        const wrap = el('div', 'node-wrap');
        const icon = st === 'done' ? '👑' : st === 'locked' ? '🔒' : '✦';
        const btn = el('button', `node ${st}`, icon);
        if (st !== 'locked') { btn.dataset.action = 'start-lesson'; btn.dataset.id = l.id; }
        if (st === 'current') btn.insertAdjacentHTML('afterbegin', `<span class="start-bubble">${tr('start')}</span>`);
        wrap.appendChild(btn);
        wrap.appendChild(el('div', 'node-label', tl(l.title)));
        path.appendChild(wrap);
      });
      root.appendChild(path);
    });
  }

  /* ---------------- Exercise generation ---------------- */
  function buildQueue(lesson) {
    const terms = lesson.terms, pool = allTerms(S.courseId), q = [];
    terms.forEach(t => q.push({ type: 'intro', term: t }));
    const hasR = course().hasReading;
    const exTypes = hasR ? ['chooseMeaning', 'chooseTerm', 'listen', 'type'] : ['chooseMeaning', 'chooseTerm', 'listen', 'type'];
    terms.forEach((t, i) => {
      const type = exTypes[i % exTypes.length];
      q.push({ type, term: t, options: shuffle([t, ...distractors(t, 3)]) });
    });
    if (terms.length >= 3) q.push({ type: 'match', terms: terms.slice(0, Math.min(5, terms.length)) });
    const intros = q.filter(x => x.type === 'intro');
    return [...intros, ...shuffle(q.filter(x => x.type !== 'intro'))];
  }

  /* ---------------- LESSON player ---------------- */
  let L = null;
  function startLesson(id) {
    const lesson = lessonById(S.courseId, id); if (!lesson) return;
    L = { lesson, queue: buildQueue(lesson), idx: 0, mistakes: 0, combo: 0, bestCombo: 0,
          lanterns: S.lanterns, answered: false, picked: null, matchSel: null, matched: 0 };
    $('#lesson').classList.remove('hidden'); renderStep();
  }
  function exitLesson() { $('#lesson').classList.add('hidden'); L = null; go('learn'); }

  function renderStep() {
    const step = L.queue[L.idx];
    const pct = Math.round((L.idx / L.queue.length) * 100);
    L.answered = false; L.picked = null; L.matchSel = null;
    let body = '';
    if (step.type === 'intro') body = viewIntro(step);
    else if (step.type === 'chooseMeaning') body = viewChoose(step, 'meaning');
    else if (step.type === 'chooseTerm') body = viewChoose(step, 'term');
    else if (step.type === 'listen') body = viewListen(step);
    else if (step.type === 'type') body = viewType(step);
    else if (step.type === 'match') body = viewMatch(step);
    $('#lesson').innerHTML = `
      <div class="lesson">
        <div class="lhead">
          <button class="close" data-action="lesson-quit">✕</button>
          <div class="lbar"><i style="width:${pct}%"></i></div>
          <div class="lhearts">${lifeIcon()} ${Math.max(0, L.lanterns)}</div>
        </div>
        <div class="qbody" id="qbody">${body}</div>
        <div class="checkbar" id="checkbar">${footFor(step)}</div>
        <div class="lesson-deco">${course().mascot}</div>
      </div>`;
    if (step.type === 'intro') speak(step.term.term);
    if (step.type === 'listen') setTimeout(() => speak(step.term.term), 350);
    if (step.type === 'type') setTimeout(() => { const i = $('#typein'); if (i) i.focus(); }, 60);
  }
  const footFor = step =>
    step.type === 'intro' ? `<button class="btn" data-action="lesson-next">${tr('continue')}</button>`
    : step.type === 'match' ? `<button class="btn flat" disabled>Match all the pairs</button>`
    : `<button class="btn flat" id="checkbtn" data-action="lesson-check" disabled>${tr('check')}</button>`;

  function viewIntro(step) {
    const t = step.term;
    return `<div class="qtitle">${tr('new_word')}</div>
      <div class="center" style="padding:14px 0">
        <div style="font-size:62px">${t.emoji}</div>
        <div style="font-size:46px;font-weight:900;margin-top:6px">${esc(t.term)}</div>
        ${t.reading ? `<div style="color:var(--muted);font-weight:700;font-size:18px">${esc(t.reading)}</div>` : ''}
        <div style="font-size:20px;font-weight:800;margin-top:6px">${esc(tm(t.en))}</div>
        ${t.ex ? `<div style="margin-top:14px;color:var(--muted);font-weight:700">${esc(t.ex)} <span style="opacity:.7">— ${esc(t.exen)}</span></div>` : ''}
        <button class="speaker" data-action="speak" data-text="${esc(t.term)}" style="margin-top:16px">🔊</button>
      </div>`;
  }
  function viewChoose(step, mode) {
    const t = step.term;
    if (mode === 'meaning') return `
      <div class="qtitle">${tr('mean_q')}</div>
      <div class="prompt-card"><button class="speaker" data-action="speak" data-text="${esc(t.term)}">🔊</button>
        <div class="bubble">${esc(t.term)}${t.reading ? `<div class="rd">${esc(t.reading)}</div>` : ''}</div></div>
      <div class="choices">${step.options.map((o, i) =>
        `<button class="choice" data-action="choose" data-idx="${i}"><span class="em">${o.emoji}</span>${esc(tm(o.en))}<span class="num">${i + 1}</span></button>`).join('')}</div>`;
    return `<div class="qtitle">Pick “${esc(tm(t.en))}”</div>
      <div class="choices">${step.options.map((o, i) =>
        `<button class="choice" data-action="choose" data-idx="${i}"><span class="em">${o.emoji}</span><span>${esc(o.term)}${o.reading ? ` <small style="color:var(--muted)">${esc(o.reading)}</small>` : ''}</span><span class="num">${i + 1}</span></button>`).join('')}</div>`;
  }
  function viewListen(step) {
    return `<div class="qtitle">Tap what you hear</div>
      <div class="prompt-card"><button class="speaker" data-action="speak" data-text="${esc(step.term.term)}">🔊</button>
        <div style="color:var(--muted);font-weight:700">Listen and choose</div></div>
      <div class="choices">${step.options.map((o, i) =>
        `<button class="choice" data-action="choose" data-idx="${i}"><span>${esc(o.term)}${o.reading ? ` <small style="color:var(--muted)">${esc(o.reading)}</small>` : ''}</span><span class="num">${i + 1}</span></button>`).join('')}</div>`;
  }
  function viewType(step) {
    const t = step.term, wants = t.reading ? 'the ' + readingWord(course()) : 'the word';
    return `<div class="qtitle">Type ${wants}</div>
      <div class="prompt-card"><button class="speaker" data-action="speak" data-text="${esc(t.term)}">🔊</button>
        <div class="bubble">${esc(t.term)}<div class="rd">${esc(tm(t.en))}</div></div></div>
      <input id="typein" class="tinput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t.reading ? readingWord(course()) + ' (accents optional)…' : 'type here…'}">`;
  }
  function viewMatch(step) {
    const left = step.terms.map((t, i) => ({ t, i, side: 'L' }));
    const right = shuffle(step.terms.map((t, i) => ({ t, i, side: 'R' })));
    L.matchTotal = step.terms.length;
    const cell = (it, label) => `<button class="choice" data-action="match" data-side="${it.side}" data-idx="${it.i}">${esc(label)}</button>`;
    return `<div class="qtitle">Tap the matching pairs</div>
      <div class="match-grid"><div style="display:grid;gap:10px">${left.map(it => cell(it, it.t.term)).join('')}</div>
      <div style="display:grid;gap:10px">${right.map(it => cell(it, tm(it.t.en))).join('')}</div></div>`;
  }
  function onChoose(idx) {
    if (L.answered) return;
    L.picked = idx;
    document.querySelectorAll('#qbody .choice').forEach((c, i) => c.classList.toggle('sel', i === idx));
    const b = $('#checkbtn'); if (b) { b.disabled = false; b.classList.remove('flat'); }
  }
  function lessonCheck() {
    const step = L.queue[L.idx]; let correct = false, answerText = '';
    if (step.type === 'type') {
      const want = step.term.reading || step.term.term;
      const val = norm($('#typein').value);
      correct = !!val && (val === norm(want) || val === norm(want).replace(/[1-5]/g, ''));
      answerText = step.term.reading || step.term.term;
    } else {
      if (L.picked == null) return;
      correct = step.options[L.picked].id === step.term.id;
      answerText = tm(step.term.en) + (step.term.reading ? ` · ${step.term.reading}` : '');
      document.querySelectorAll('#qbody .choice').forEach((c, i) => {
        c.disabled = true;
        if (step.options[i].id === step.term.id) c.classList.add('right');
        else if (i === L.picked) c.classList.add('wrong');
      });
    }
    L.answered = true;
    if (correct) { L.combo++; L.bestCombo = Math.max(L.bestCombo, L.combo); }
    else { L.combo = 0; L.mistakes++; L.lanterns = Math.max(0, L.lanterns - 1); S.misses[step.term.id] = (S.misses[step.term.id] || 0) + 1; }
    sfx(correct ? 'good' : 'bad'); buzz(correct);
    speak(step.term.term);
    const bar = $('#checkbar'); bar.className = 'checkbar ' + (correct ? 'ok' : 'bad');
    bar.innerHTML = `<div class="feedline ${correct ? 'ok' : 'bad'}"><span class="fi">${correct ? '✅' : '❌'}</span>
        <span>${correct ? 'Nice!' : 'Answer: ' + esc(answerText)}</span></div>
      <button class="btn ${correct ? '' : 'coral'}" data-action="lesson-next">Continue</button>`;
  }
  function onMatch(side, idx) {
    const btn = document.querySelector(`#qbody .choice[data-side="${side}"][data-idx="${idx}"]`);
    if (!btn || btn.classList.contains('gone')) return;
    if (!L.matchSel) { L.matchSel = { side, idx, btn }; btn.classList.add('sel'); return; }
    if (L.matchSel.side === side) { L.matchSel.btn.classList.remove('sel'); L.matchSel = { side, idx, btn }; btn.classList.add('sel'); return; }
    if (L.matchSel.idx === idx) {
      [L.matchSel.btn, btn].forEach(b => { b.classList.add('right'); setTimeout(() => b.classList.add('gone'), 250); });
      L.matched++; speak(L.queue[L.idx].terms[idx].term);
      if (L.matched >= L.matchTotal) { L.combo++; setTimeout(nextStep, 450); }
    } else {
      const a = btn, b = L.matchSel.btn; [a, b].forEach(x => x.classList.add('wrong'));
      L.mistakes++; L.lanterns = Math.max(0, L.lanterns - 1);
      setTimeout(() => [a, b].forEach(x => x.classList.remove('wrong', 'sel')), 450);
    }
    L.matchSel = null;
  }
  function nextStep() {
    if (L.lanterns <= 0) return outOfLanterns();
    L.idx++; if (L.idx >= L.queue.length) return completeLesson();
    renderStep();
  }
  function outOfLanterns() {
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      <div class="big">${lifeIcon()}</div><h1 style="color:var(--coral-d)">Out of ${course().lives ? course().lives.name : 'lanterns'}</h1>
      <p class="center" style="color:var(--muted)">Refill to keep going, or head back and study.</p>
      <div class="mt"><button class="btn gold" data-action="refill-lanterns">Refill for 20 💎</button></div>
      <div class="mt"><button class="btn ghost" data-action="lesson-quit">Back</button></div></div></div>`;
  }
  // The crow, drawn as SVG art (faces right toward its dance partner) so it
  // always renders — no fragile emoji. Parts are classed for CSS animation.
  const CROW_SVG = `<svg viewBox="0 0 200 192" class="crowimg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cb" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0" stop-color="#2f3b47"/><stop offset="0.45" stop-color="#19222b"/><stop offset="1" stop-color="#0a0e13"/>
      </linearGradient>
      <linearGradient id="csheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4a6ea8" stop-opacity="0.45"/><stop offset="0.6" stop-color="#5b3b8a" stop-opacity="0.16"/><stop offset="1" stop-color="#13324a" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g stroke="#141a1f" stroke-linecap="round">
      <path stroke-width="5" d="M98 152 L94 178"/><path stroke-width="5" d="M116 152 L120 178"/>
      <g stroke-width="3.4"><path d="M94 178 l-9 8 M94 178 l0 11 M94 178 l9 6"/><path d="M120 178 l-9 6 M120 178 l0 11 M120 178 l9 8"/></g>
    </g>
    <path d="M80 130 C52 144 26 158 9 168 C4 171 7 176 13 173 C43 162 72 150 92 140 Z" fill="url(#cb)"/>
    <path d="M98 86 C134 86 152 108 150 130 C148 150 120 160 94 156 C70 152 56 138 56 114 C56 97 74 86 98 86 Z" fill="url(#cb)"/>
    <circle cx="140" cy="80" r="31" fill="url(#cb)"/>
    <path d="M118 56 C132 48 160 50 168 72 C150 62 128 64 116 78 Z" fill="url(#cb)"/>
    <path d="M128 64 C152 58 166 70 164 92 C150 76 130 80 120 92 Z" fill="url(#csheen)"/>
    <path d="M104 94 C132 94 148 112 145 132 C126 120 102 122 88 130 Z" fill="url(#csheen)"/>
    <path d="M98 94 C126 96 144 114 140 138 C120 126 96 128 80 136 C76 112 84 98 98 94 Z" fill="#0e151c"/>
    <path d="M96 132 C116 133 134 137 146 143 L144 150 C124 143 100 139 84 139 Z" fill="#0c1218"/>
    <path d="M166 72 L198 82 L167 91 Z" fill="#12171d"/>
    <circle cx="147" cy="73" r="8.5" fill="#0a0d12"/>
    <circle cx="144" cy="70" r="2.6" fill="#e6edf0"/>
  </svg>`;
  // Temple-tap meme: smug crow, one wing feather tapping his head. Can't
  // forget a word you've mastered. (User storyboard.)
  const TAP_SVG = `<svg viewBox="0 0 200 170" class="thsvg" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="160" rx="46" ry="7" fill="#000" opacity=".12"/>
    <ellipse cx="100" cy="112" rx="34" ry="40" fill="#14191f"/>
    <path d="M76 96 C66 104 62 116 64 128 C72 124 78 116 80 106 Z" fill="#0d1319"/>
    <g class="th-head">
      <circle cx="104" cy="62" r="30" fill="#14191f"/>
      <path d="M130 56 L156 62 L130 70 Z" fill="#f4c542"/>
      <path d="M126 72 C130 76 136 76 140 73" stroke="#f4c542" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="114" cy="54" r="7" fill="#fff"/><circle cx="116" cy="55" r="3.4" fill="#222"/>
      <path d="M88 50 C92 46 100 45 104 48" stroke="#0a0f14" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M92 56 C96 53 102 53 106 55 L106 60 C100 58 95 58 92 60 Z" fill="#14191f"/>
      <circle cx="98" cy="57" r="4.6" fill="#fff"/><circle cx="99.5" cy="58" r="2.4" fill="#222"/>
    </g>
    <g class="th-wing"><path d="M74 108 C64 92 66 74 78 62 C84 58 90 56 94 56 C90 64 86 74 86 84 C84 96 80 104 74 108 Z" fill="#0d1319"/>
      <path d="M92 58 L96 50 L100 57 Z" fill="#0d1319"/></g>
    <g class="th-spark"><circle cx="70" cy="34" r="2.5" fill="#f6c445"/><path d="M60 26 l4 4 M58 40 l5 -1 M70 20 l1 5" stroke="#f6c445" stroke-width="2.5" stroke-linecap="round"/></g>
  </svg>`;
  // Moonwalk crow: fedora + white glove, gliding backward, spin, toe-stand.
  const MJ_SVG = `<svg viewBox="0 0 240 170" class="mjsvg" xmlns="http://www.w3.org/2000/svg">
    <g class="mj-all">
      <g transform="rotate(-8 120 120)">
        <g class="mj-legA"><rect x="110" y="122" width="5" height="22" rx="2.5" fill="#f4c542"/><path d="M104 142 L118 142 L121 148 L101 148 Z" fill="#f4c542"/></g>
        <g class="mj-legB"><rect x="128" y="122" width="5" height="22" rx="2.5" fill="#f4c542"/><path d="M122 142 L136 142 L139 148 L119 148 Z" fill="#f4c542"/></g>
        <ellipse cx="122" cy="100" rx="22" ry="27" fill="#12181f"/>
        <path class="mj-wing" d="M112 92 C100 100 94 112 96 122 C104 118 112 110 116 100 Z" fill="#0d1319"/>
        <circle cx="98" cy="122" r="5.5" fill="#fff"/>
        <g class="mj-head">
          <circle cx="112" cy="64" r="16" fill="#12181f"/>
          <path d="M98 60 L82 65 L98 70 Z" fill="#f4c542"/>
          <circle cx="106" cy="60" r="4.2" fill="#fff"/><circle cx="104.5" cy="60.5" r="2" fill="#222"/>
          <g class="mj-hat"><rect x="92" y="46" width="41" height="5" rx="2.5" fill="#0a0d11"/>
            <path d="M100 47 L100 30 C100 26 125 26 125 30 L125 47 Z" fill="#0a0d11"/>
            <rect x="100" y="39" width="25" height="5" fill="#7d1a1a"/></g>
        </g>
      </g>
    </g>
  </svg>`;
  // Night watch: moonlit sky, drifting clouds, city skyline, the crow leaning
  // on a lamppost gazing over the city. (User storyboard — original art.)
  const NIGHT_SVG = `<svg viewBox="0 0 340 190" class="nwsvg" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1526"/><stop offset="1" stop-color="#1b2942"/></linearGradient></defs>
    <rect width="340" height="190" rx="14" fill="url(#nsky)"/>
    <circle class="nw-star" cx="40" cy="34" r="1.6" fill="#dfe8f5"/><circle class="nw-star s2" cx="96" cy="22" r="1.3" fill="#dfe8f5"/>
    <circle class="nw-star s3" cx="150" cy="44" r="1.7" fill="#dfe8f5"/><circle class="nw-star s4" cx="205" cy="26" r="1.2" fill="#dfe8f5"/>
    <circle class="nw-star s5" cx="315" cy="52" r="1.5" fill="#dfe8f5"/>
    <circle cx="262" cy="46" r="30" fill="#e9e5d8" opacity=".14"/>
    <circle cx="262" cy="46" r="21" fill="#e9e5d8"/>
    <circle cx="255" cy="40" r="4" fill="#d5d0c0"/><circle cx="268" cy="52" r="3" fill="#d5d0c0"/><circle cx="266" cy="38" r="2" fill="#d5d0c0"/>
    <g class="nw-cloud1" opacity=".85"><ellipse cx="0" cy="52" rx="34" ry="9" fill="#23324e"/><ellipse cx="24" cy="46" rx="22" ry="7" fill="#23324e"/></g>
    <g class="nw-cloud2" opacity=".7"><ellipse cx="0" cy="86" rx="42" ry="10" fill="#1e2c46"/><ellipse cx="30" cy="80" rx="24" ry="7" fill="#1e2c46"/></g>
    <g fill="#0a1120">
      <rect x="8" y="118" width="34" height="72"/><rect x="46" y="132" width="26" height="58"/><rect x="76" y="108" width="30" height="82"/>
      <rect x="196" y="126" width="30" height="64"/><rect x="230" y="110" width="34" height="80"/><rect x="268" y="134" width="26" height="56"/><rect x="298" y="120" width="34" height="70"/>
    </g>
    <g fill="#f4c542"><rect class="nw-win" x="14" y="126" width="5" height="6"/><rect class="nw-win w2" x="84" y="118" width="5" height="6"/>
      <rect class="nw-win w3" x="238" y="120" width="5" height="6"/><rect class="nw-win w4" x="306" y="130" width="5" height="6"/>
      <rect class="nw-win w5" x="56" y="140" width="5" height="6"/><rect class="nw-win w6" x="204" y="136" width="5" height="6"/></g>
    <rect y="182" width="340" height="8" rx="4" fill="#080d18"/>
    <g>
      <rect x="160" y="66" width="5" height="118" rx="2" fill="#1a222e"/>
      <rect x="140" y="62" width="27" height="5" rx="2.5" fill="#1a222e"/>
      <circle class="nw-lampglow" cx="141" cy="74" r="17" fill="#f4c542" opacity=".2"/>
      <circle cx="141" cy="72" r="6" fill="#f4c542"/>
    </g>
    <g class="nw-crow">
      <path class="nw-cape" d="M143 128 C156 142 162 162 158 180 C150 172 144 168 138 166 C141 152 141 140 143 128 Z" fill="#7d1a1a"/>
      <g transform="rotate(8 138 180)">
        <ellipse cx="138" cy="155" rx="18" ry="24" fill="#12181f"/>
        <path d="M128 140 C118 146 113 156 115 168 C124 164 130 156 132 148 Z" fill="#0d1319"/>
        <rect x="128" y="176" width="5" height="10" rx="2" fill="#f4c542"/><rect x="140" y="176" width="5" height="10" rx="2" fill="#f4c542"/>
        <g class="nw-head">
          <circle cx="131" cy="125" r="15.5" fill="#12181f"/>
          <path d="M118 121 L101 126 L118 131 Z" fill="#f4c542"/>
          <circle cx="125" cy="121" r="4.4" fill="#fff"/><circle class="nw-glint" cx="123.5" cy="121.5" r="2.1" fill="#20303e"/>
        </g>
      </g>
    </g>
  </svg>`;
  // Superhero crow: swoop → superhero landing (squash + dust) → hero rise → pose.
  // Hand-built layered SVG driven by CSS keyframes (see .heroCrow styles).
  const HERO_SVG = `<svg viewBox="0 0 220 200" class="hcsvg" xmlns="http://www.w3.org/2000/svg">
    <ellipse class="hc-shadow" cx="110" cy="184" rx="42" ry="8" fill="#000" opacity=".18"/>
    <g class="hc-dust"><circle cx="70" cy="176" r="10" fill="#d9d9d9"/><circle cx="150" cy="178" r="12" fill="#e4e0d6"/><circle cx="96" cy="184" r="7" fill="#d9d9d9"/><circle cx="128" cy="186" r="8" fill="#e4e0d6"/></g>
    <path class="hc-cape" d="M110 96 C84 108 66 138 60 172 C84 162 100 158 110 158 C120 158 136 162 160 172 C154 138 136 108 110 96 Z" fill="#d92525"/>
    <path class="hc-cape2" d="M110 98 C92 110 80 134 76 160 C94 152 104 150 110 150 Z" fill="#991616"/>
    <g class="hc-body">
      <g class="hc-wingR"><path d="M132 112 C160 96 186 96 204 108 C188 122 166 132 140 134 Z" fill="#0d1319"/></g>
      <rect x="94" y="158" width="9" height="24" rx="4" fill="#f4c542"/>
      <rect x="118" y="158" width="9" height="24" rx="4" fill="#f4c542"/>
      <path d="M86 182 L106 182 L110 190 L82 190 Z" fill="#f4c542"/>
      <path d="M114 182 L134 182 L138 190 L110 190 Z" fill="#f4c542"/>
      <ellipse cx="110" cy="132" rx="35" ry="42" fill="#14191f"/>
      <path d="M85 118 C96 108 124 108 135 118 C128 130 92 130 85 118 Z" fill="#222b34"/>
      <g class="hc-wingL"><path d="M88 112 C60 96 34 96 16 108 C32 122 54 132 80 134 Z" fill="#10161c"/></g>
      <g class="hc-head">
        <circle cx="110" cy="76" r="31" fill="#14191f"/>
        <path d="M138 70 L166 78 L138 88 Z" fill="#f4c542"/>
        <path d="M138 79 L160 81 L138 86 Z" fill="#caa236"/>
        <circle cx="122" cy="70" r="8.5" fill="#fff"/><circle cx="124.5" cy="71" r="4" fill="#222"/>
        <rect class="hc-lid" x="112" y="61" width="20" height="18" rx="9" fill="#14191f"/>
        <path d="M92 56 C98 46 112 42 122 46 C114 50 106 56 102 64 Z" fill="#0d1319"/>
      </g>
    </g>
  </svg>`;
  // Celebration crow: the user's animated Lottie crow (vendored offline in
  // lottie/), with emoji fallback if the player didn't load.
  let CROW_ANIM = null;   // preloaded so the crow can never fail to appear
  fetch('lottie/crow.json').then(r => r.json()).then(j => { CROW_ANIM = j; }).catch(() => {});
  const crow = cls => `<span class="crow lottie ${cls || ''}"><div class="lbox"></div></span>`;
  function mountCrows() {
    document.querySelectorAll('.crow .lbox:not(.mounted)').forEach(box => {
      box.classList.add('mounted');
      if (window.lottie && CROW_ANIM) {
        try { lottie.loadAnimation({ container: box, renderer: 'svg', loop: true, autoplay: true, animationData: CROW_ANIM }); return; } catch {}
      }
      const p = box.parentElement; p.classList.remove('lottie'); p.classList.add('emoji'); p.textContent = '🐦‍⬛';
    });
  }
  // auto-mount whenever a celebration renders — survives any future template edits
  new MutationObserver(() => mountCrows()).observe(document.getElementById('lesson'), { childList: true, subtree: true });

  // Staged duo celebrations: entrance → performance → sparkle. The crow and
  // the language's animal run in, land with squash-&-stretch, and perform.
  function celebrate(mascot) {
    const v = sample(['party', 'fireworks', 'trophy', 'highfive', 'fly', 'confetti', 'night', 'mj', 'genius'], 1)[0];
    const pal = `<span class="pal">${mascot}</span>`;
    const conf = Array.from({ length: 18 }, (_, i) =>
      `<span class="conf" style="left:${3 + i * 5.4}%;animation-delay:${(i % 9) * 0.12}s;font-size:${16 + (i % 3) * 5}px">${['🎉', '⭐', '✨', '🟡', '🔴', '🔵', '🟣', '💛', '🎊'][i % 9]}</span>`).join('');
    const bursts = Array.from({ length: 6 }, (_, i) =>
      `<span class="fw f${i}" style="animation-delay:${i * 0.28}s">${['🎆', '🎇', '💥', '✨', '🎆', '🌟'][i]}</span>`).join('');
    const notes = '<span class="cnote n1">🎵</span><span class="cnote n2">🎶</span><span class="cnote n3">🎵</span>';
    const stages = {
      party: `<div class="cstage"><span class="discostr"></span><span class="disco">🪩</span>${notes}
        <div class="duo wide"><span class="enterL">${crow('groove')}</span><span class="enterR"><span class="pal groove2">${mascot}</span></span></div>
        <span class="spotL"></span><span class="spotR"></span></div>`,
      fireworks: `<div class="cstage">${bursts}
        <div class="duo wide"><span class="enterL">${crow('jump')}</span><span class="enterR"><span class="pal jump2">${mascot}</span></span></div></div>`,
      trophy: `<div class="cstage"><span class="cup">🏆</span><span class="ring gold"></span>
        <div class="podium"></div>
        <div class="duo wide onpodium"><span class="enterL">${crow('hop')}</span><span class="enterR"><span class="pal hop2">${mascot}</span></span></div></div>`,
      highfive: `<div class="cstage"><span class="ring"></span><span class="hf-burst">🙌</span>
        <div class="duo hf">${crow('dashL')}<span class="pal dashR">${mascot}</span></div></div>`,
      fly: `<div class="cstage"><div class="heroCrow">${HERO_SVG}</div>
        <div class="duo-cheer"><span class="pal jump2" style="animation-delay:1.8s">${mascot}</span></div></div>`,
      confetti: `<div class="cstage">${conf}
        <div class="duo wide"><span class="enterL">${crow('twirl')}</span><span class="enterR"><span class="pal groove2">${mascot}</span></span></div></div>`,
      night: `<div class="cstage nightScene">${NIGHT_SVG}</div>`,
      mj: `<div class="cstage"><span class="disco">🪩</span>${notes}<div class="mjw">${MJ_SVG}</div><span class="spotL"></span><span class="spotR"></span></div>`,
      genius: `<div class="cstage"><div class="thw">${TAP_SVG}</div><span class="th-bulb">💡</span></div>`,
    };
    const titles = {
      party: '🎉 You crushed it!', fireworks: '🎆 Spectacular!', trophy: '🏆 Champion run!',
      highfive: '🙌 Nailed it together!', fly: '🦸 Superhero landing!', night: '🌙 Night watch — the city can rest.', mj: '🕺 Moonwalk master!', genius: "☝️ Can't forget what you've mastered.", confetti: 'You nailed it!',
    };
    return `<div class="celebrate ${v}">${stages[v]}<h1 class="cmaster">${titles[v]}</h1></div>`;
  }
  function completeLesson() {
    sfx('win');
    const lesson = L.lesson, firstTime = !S.done[lesson.id], c = course();
    const gainXP = 10 + L.bestCombo * 2 + (L.mistakes === 0 ? 5 : 0);
    S.done[lesson.id] = Math.max(S.done[lesson.id] || 0, L.mistakes === 0 ? 3 : L.mistakes <= 2 ? 2 : 1);
    S.xp += gainXP; S.xpWeek += gainXP; if (firstTime) S.gems += 5;
    S.lanterns = S.lanternsMax;
    if (S.lastDay !== today()) { S.streak += 1; S.lastDay = today(); }
    const newCards = [];
    lesson.terms.forEach(t => { if (t.card && !S.owned[t.id]) { S.owned[t.id] = 1; newCards.push(t); } else if (t.card) S.owned[t.id]++; });
    bumpLeague();
    persist(); renderTop(); sbSync();
    const cardHtml = newCards.length
      ? `<div class="mt"><div style="font-weight:800;color:var(--plum-d)">✨ New word card${newCards.length > 1 ? 's' : ''}!</div>
         <div class="card-grid" style="max-width:340px;margin:10px auto 0;padding:0">${newCards.map(t => glyphCard(t, true).outerHTML).join('')}</div></div>` : '';
    // celebratory animation (random variant, themed to the language mascot)
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      ${celebrate(c.mascot)}
      <div class="reward-row">
        <div class="reward"><div class="rk">XP</div><div class="rv">+${gainXP}</div></div>
        <div class="reward"><div class="rk">Top combo</div><div class="rv">${L.bestCombo}🔥</div></div>
        <div class="reward"><div class="rk">Accuracy</div><div class="rv">${Math.round(100 * (L.queue.length - L.mistakes) / L.queue.length)}%</div></div>
      </div>${cardHtml}
      <div class="mt"><button class="btn" data-action="lesson-quit">Continue</button></div></div></div>`;
  }

  /* ---------------- GLYPH CARD ---------------- */
  function glyphCard(t, owned) {
    const r = REALMS[t.realm] || REALMS.mind, g = r.grad;
    const foil = t.rarity === 'rare' || t.rarity === 'legendary';
    const dots = t.rarity === 'legendary' ? '★★★' : t.rarity === 'rare' ? '★★' : '★';
    const node = el('div', 'glyph' + (foil ? ' foil' : '') + (t.legendary ? ' legendary' : '') + (owned ? '' : ' locked'));
    node.style.cssText = `--g1:${g[0]};--g2:${g[1]};--g3:${g[2]}`;
    node.innerHTML = `
      <div class="band"><span class="realm">${r.icon} ${r.name}</span>
        <button class="spk" data-action="speak" data-text="${esc(t.term)}">🔊</button></div>
      <div class="face"><div class="emoji">${t.emoji}</div>
        <div class="word">${esc(t.term)}</div><div class="py">${esc(t.reading || '')}</div></div>
      <div class="mean">${esc(tm(t.en))}</div>
      <div class="dots">${dots}</div>
      ${owned ? '' : '<div class="lockicon">🔒</div>'}`;
    return node;
  }
  function renderCollection() {
    const root = $('#scr-cards'); root.innerHTML = '';
    const cards = collectibles(S.courseId), got = cards.filter(c => S.owned[c.id]).length;
    root.appendChild(el('div', 'section-head', `<h1>${tr('cards_title')}</h1><p>${got} / ${cards.length} collected. The badge is the word's <b>theme</b> (Light, Nature, Heart…) — just for grouping & flavour.</p>`));
    const grid = el('div', 'card-grid');
    cards.forEach(c => grid.appendChild(glyphCard(c, !!S.owned[c.id])));
    root.appendChild(grid);
  }

  /* ---------------- STUDY / ARCHIVE ---------------- */
  let ST = null;
  function studyDeckList() {
    const all = allTerms(S.courseId);
    if (S.studyDeck === 'all') return all;
    if (S.studyDeck === 'weak') return all.filter(t => (S.misses || {})[t.id]).sort((a, b) => S.misses[b.id] - S.misses[a.id]);
    const owned = all.filter(t => S.owned[t.id]);
    return owned.length ? owned : all;
  }
  function frontOptions() { return course().hasReading ? ['char', 'py', 'mean'] : ['char', 'mean']; }
  function safeFront() { const o = frontOptions(); return o.includes(S.studyFront) ? S.studyFront : 'char'; }
  function buildStudy(reset) {
    const deck = studyDeckList(), f = safeFront();
    const opts = frontOptions();
    const fronts = deck.map((_, i) => S.studyMode === 'alt' ? opts[i % opts.length] : f);
    ST = { deck, idx: (reset || !ST) ? 0 : Math.min(ST.idx, Math.max(0, deck.length - 1)), fronts, flipped: false };
  }
  function renderStudy() {
    buildStudy(false);
    const c = course(), root = $('#scr-study'); root.innerHTML = '';
    root.appendChild(el('div', 'section-head', `<h1>${tr('study_title')}</h1><p>${tl('Flip through your words. Pick what shows on the front.')}</p>`));
    const charLabel = c.id === 'zh' ? '字 Character' : 'Word';
    const rLabel = readingWord(c).replace(/^./, m => m.toUpperCase());
    const frontSeg = course().hasReading
      ? `${seg('front', 'char', charLabel)}${seg('front', 'py', rLabel)}${seg('front', 'mean', 'Meaning')}`
      : `${seg('front', 'char', charLabel)}${seg('front', 'mean', 'Meaning')}`;
    const bar = el('div', 'study-bar');
    bar.innerHTML = `
      <div><div class="seg-label">Deck</div><div class="seg">${seg('deck', 'collected', tl('Collected'))}${seg('deck', 'all', tl('All words'))}${seg('deck', 'weak', '💪 ' + tl('Weak'))}</div></div>
      <div style="${S.studyMode === 'alt' ? 'opacity:.35;pointer-events:none' : ''}"><div class="seg-label">Front shows${S.studyMode === 'alt' ? ' — ' + tl('Alternate') + ' 🔀' : ''}</div><div class="seg">${frontSeg}</div></div>
      <div><div class="seg-label">Mode</div><div class="seg">${seg('mode', 'fixed', tl('Fixed'))}${seg('mode', 'alt', '🔀 ' + tl('Alternate'))}</div>
        <div class="note" style="margin-top:6px">${S.studyMode === 'alt'
          ? `Alternate: each card randomly shows the ${c.id === 'zh' ? 'character' : 'word'}, ${course().hasReading ? readingWord(c) + ', ' : ''}or meaning on the front — so you’re quizzed from every angle.`
          : `Fixed: every card shows the same field on the front. Switch to Alternate to be quizzed from all sides.`}</div></div>`;
    root.appendChild(bar);
    const wrap = el('div', 'study-wrap'); wrap.id = 'study-wrap'; root.appendChild(wrap);
    renderStudyCard();
  }
  const seg = (key, val, label) => `<button data-action="study-set" data-key="${key}" data-val="${val}" class="${(key === 'deck' ? S.studyDeck : key === 'front' ? safeFront() : S.studyMode) === val ? 'on' : ''}">${label}</button>`;
  function frontFace(t, front) {
    if (front === 'py') return `<div class="big-py">${esc(t.reading || t.term)}</div><div class="small-cap">${tl('tap to reveal')}</div>`;
    if (front === 'mean') return `<div class="big-en">${esc(tm(t.en))}</div><div class="small-cap">${tl('tap to reveal')}</div>`;
    return `<div class="topglyph">${esc(t.term)}</div><div class="small-cap">${tl('tap to reveal')}</div>`;
  }
  function renderStudyCard() {
    const wrap = $('#study-wrap'); if (!wrap) return;
    if (!ST.deck.length) { wrap.innerHTML = `<div class="empty">${S.studyDeck === 'weak' ? 'No weak words yet — words you miss will collect here for review. 💪' : 'No words yet — open a lesson first.'}</div>`; return; }
    const t = ST.deck[ST.idx], front = ST.fronts[ST.idx] || safeFront(), r = REALMS[t.realm] || REALMS.mind;
    wrap.innerHTML = `
      <div class="flip ${ST.flipped ? 'flipped' : ''}" data-action="study-flip">
        <div class="ff">
          <div class="side front">${frontFace(t, front)}<div class="realm-tag">${r.icon} ${r.name}</div></div>
          <div class="side back">
            <div class="topglyph" style="font-size:54px">${esc(t.term)}</div>
            ${t.reading ? `<div class="big-py" style="font-size:24px">${esc(t.reading)}</div>` : ''}
            <div class="big-en" style="font-size:22px">${esc(tm(t.en))}</div>
            ${t.ex ? `<div class="ex"><div class="exs">${esc(t.ex)}</div>${t.exr ? `<div class="exr">${esc(t.exr)}</div>` : ''}<div class="exe">${esc(t.exen)}</div></div>` : ''}
          </div>
        </div>
      </div>
      <div class="study-controls">
        <button class="icon-btn" data-action="study-prev">◀</button>
        <button class="icon-btn" data-action="study-speak">🔊</button>
        <button class="icon-btn" data-action="study-shuffle">🔀</button>
        <button class="icon-btn" data-action="study-next">▶</button>
      </div>
      <div class="study-meta">Card ${ST.idx + 1} / ${ST.deck.length}${S.studyMode === 'alt' ? ' · front randomised' : ''}</div>`;
    // (no auto-speak — tap 🔊 to hear it; auto-speaking on every card was the "random ni hao")
  }
  function studyMove(d) { ST.idx = (ST.idx + d + ST.deck.length) % ST.deck.length; ST.flipped = false; renderStudyCard(); }

  /* ---------------- ARENA: rivals / friends / tournament ---------------- */
  let arenaTab = 'rivals';
  function rivalUnlocked(i) { return i === 0 || beatenSet()[course().rivals[i - 1].id]; }
  function renderArena() {
    const root = $('#scr-battle'); root.innerHTML = '';
    root.appendChild(el('div', 'section-head', `<h1>${tr('arena_title')}</h1><p>${tl('Battle rivals, add friends, and run a tournament.')}</p>`));
    const nav = el('div', 'subnav');
    [['rivals', '⚔️ ' + tl('Rivals')], ['friends', '👥 ' + tl('Friends')], ['tourney', '🏆 ' + tl('Tournament')]].forEach(([id, label]) => {
      nav.innerHTML += `<button data-action="arena-tab" data-id="${id}" class="${arenaTab === id ? 'on' : ''}">${label}</button>`;
    });
    root.appendChild(nav);
    if (arenaTab === 'rivals') renderRivals(root);
    else if (arenaTab === 'friends') renderFriends(root);
    else renderTourney(root);
  }
  function renderRivals(root) {
    const list = el('div', 'rival-list');
    course().rivals.forEach((rv, i) => {
      const tier = tierFor(i, course().rivals.length), unlocked = rivalUnlocked(i), beaten = beatenSet()[rv.id];
      const cls = tier.label === 'Easy' ? 'easy' : tier.label === 'Medium' ? 'med' : 'hard';
      const row = el('div', 'rival' + (unlocked ? '' : ' locked'));
      row.innerHTML = `<div class="rav">${unlocked ? rv.av : '🔒'}</div>
        <div class="rinfo"><div class="rn">${esc(rv.name)} ${beaten ? '<span class="beat">✓ beaten</span>' : ''}</div>
          <div class="rd">${unlocked ? (i === 0 ? tl('A gentle first rival.') : `${tier.hitsToWin} ${tl('correct answers to win')}`) : tl('Beat the previous rival to unlock')}</div></div>
        <div class="diff ${cls}">${tl(tier.label)}</div>`;
      if (unlocked) { row.dataset.action = 'start-battle'; row.dataset.id = rv.id; }
      list.appendChild(row);
    });
    root.appendChild(list);
  }
  function renderFriends(root) {
    ensureFriends();
    const name = S.displayName || 'You';
    const myCode = enc({ ww: 'friend', n: name, id: sbUid() || S.myId });
    const wrap = el('div', 'pad');
    const rows = [{ name, av: '😀', xp: S.xpWeek, me: true }, ...S.friends].sort((a, b) => b.xp - a.xp);
    wrap.innerHTML = `<div id="fr-inbox"></div><div class="settings-card" style="margin-bottom:14px">
        <div class="seg-label">👤 Your account</div>
        <p class="note" style="margin:4px 0 8px">Name: <b>${esc(name)}</b> — share your friend code so people can add you.</p>
        <textarea class="tinput" id="myCode" style="height:56px;text-align:left;font-size:11px" readonly>${esc(myCode)}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn sm" data-action="copy-mycode">Copy my code</button>
          <button class="btn sm ghost" data-action="edit-name">Edit name</button>
          <button class="btn sm ghost" data-action="add-by-code">＋ Add by code</button>
        </div>
        <p class="note" style="margin-top:8px">No sign-up: your name lives on this device. Full server accounts (synced friend lists, live presence) are the next step — see README.</p>
      </div>
      <div class="seg-label">Friend group · weekly XP</div>` +
      rows.map((r, i) => { const sk = r.skill || 0.45; const dcls = sk < 0.42 ? 'easy' : sk < 0.58 ? 'med' : 'hard'; const dlbl = sk < 0.42 ? 'Easy' : sk < 0.58 ? 'Medium' : 'Hard';
        return `<div class="frow ${r.me ? 'me' : ''}"><div class="fpos">${i + 1}</div><div class="fav">${r.av}</div>
        <div class="fnm">${esc(r.name)}${r.live ? ' 🟢' : ''} ${r.me ? '' : `<span class="diff ${dcls}" style="margin-left:6px">${dlbl}</span>`}</div><div class="fxp">${r.xp} XP</div>
        ${r.me ? '' : `<button class="btn sm" data-action="challenge-friend" data-id="${r.id}" style="padding:6px 10px;margin-right:4px">⚔️</button><button class="frm" data-action="remove-friend" data-id="${r.id}">✕</button>`}</div>`; }).join('') +
      `<button class="btn sky mt" data-action="add-friend">＋ Add a friend (practice bot)</button>
       <div class="seg-label" style="margin-top:14px">🤖 Quick bot match</div>
       <div style="display:flex;gap:8px;margin-top:6px">
         <button class="btn sm ghost" data-action="bot-race" data-skill="0.25">Easy</button>
         <button class="btn sm ghost" data-action="bot-race" data-skill="0.45">Medium</button>
         <button class="btn sm ghost" data-action="bot-race" data-skill="0.7">Hard</button></div>
       <div class="seg-label" style="margin-top:18px">🌐 Play a real person</div>
       <div style="display:flex;gap:8px;margin-top:6px">
         <button class="btn" data-action="create-challenge">Send a challenge</button>
         <button class="btn ghost" data-action="join-challenge">Have a code?</button>
       </div>
       <div class="seg-label" style="margin-top:18px">🌍 ${tl('Global weekly top 10')}</div><div id="cloud-lb" class="note">${sbUid() ? '…' : tl('Cloud off — see Me tab')}</div>
       <p class="note">Tap ⚔️ to race a friend now. “Send a challenge” gives you a code to share — your friend plays the same words on their device and the higher score wins (works across devices, no sign-up).</p>`;
    root.appendChild(wrap);
    const cloudIds = (S.friends || []).filter(f => (f.id || '').length > 20).map(f => f.id);
    if (sbUid() && cloudIds.length) {
      fetch(SB_URL + '/rest/v1/profiles?select=id,name,xp_week&id=in.(' + cloudIds.join(',') + ')', { headers: sbH(CLOUD.session.access_token) })
        .then(r => r.ok ? r.json() : []).then(rows => {
          let changed = false;
          rows.forEach(p => { const f = S.friends.find(x => x.id === p.id);
            if (f && (f.name !== p.name || f.xp !== p.xp_week)) { f.name = p.name; f.xp = p.xp_week; f.live = true; changed = true; } });
          if (changed) { persist(); if (arenaTab === 'friends') renderArena(); }
        }).catch(() => {});
    }
    loadInbox();
    if (sbUid()) sbLeaderboard().then(rows => { const d = $('#cloud-lb'); if (d) d.innerHTML = rows.length
      ? rows.map((r, i) => `${i + 1}. <b>${esc(r.name)}</b> — ${r.xp_week} XP`).join('<br>')
      : 'No players yet — you will appear after your next lesson.'; });
  }
  function renderTourney(root) {
    const wrap = el('div', 'pad'); const t = S.tourney;
    if (!t) {
      wrap.innerHTML = `<div class="empty" style="padding:24px 8px">🏆<br><b>Weekend Cup</b><br><span class="note">A 4-player knockout with your friend group.</span></div>
        <button class="btn" data-action="start-tourney">Start tournament</button>`;
    } else {
      const name = p => p.me ? 'You' : p.name;
      const semiResult = t.stage === 'semi' ? 'vs you — your match' : (t.youWonSemi ? 'You won ✓' : 'You lost');
      wrap.innerHTML = `<div class="seg-label">Weekend Cup · bracket</div>
        <div class="bracket">
          <div class="match"><div class="bp">😀 You</div><div class="bp">${t.oppA.av} ${esc(t.oppA.name)}</div><div class="blabel">Semifinal</div></div>
          <div class="match"><div class="bp">${t.semiBav} ${esc(t.semiB.a)}</div><div class="bp">${t.semiCav} ${esc(t.semiB.b)}</div><div class="blabel">Semifinal → ${t.finalist.av} ${esc(t.finalist.name)}</div></div>
          <div class="match final"><div class="bp">${t.stage === 'done' ? (t.champ.me ? '😀 You' : t.champ.av + ' ' + esc(t.champ.name)) : '🏆 Final'}</div><div class="blabel">${t.stage === 'done' ? 'Champion' : 'Final'}</div></div>
        </div>
        ${t.stage === 'done'
          ? `<div class="center" style="font-weight:800;margin:14px 0">${t.champ.me ? '🎉 You won the Cup! +40 💎' : `${t.champ.av} ${esc(t.champ.name)} took the Cup.`}</div>
             <button class="btn ghost" data-action="reset-tourney">New tournament</button>`
          : `<button class="btn" data-action="tourney-play">Play your ${t.stage === 'final' ? 'final' : 'semifinal'} →</button>`}`;
    }
    root.appendChild(wrap);
  }

  /* ---------------- BATTLE (turn-based, rival fights back) ---------------- */
  let B = null;
  // Boss pool correlates with the curriculum: rival i draws only from words up
  // to a matching unit, and prefers words you've actually LEARNED — so the first
  // boss uses early words you know and the last boss uses the hardest/latest.
  function battlePool(maxUnit) {
    const all = allTerms(S.courseId);
    if (maxUnit == null) return all;
    const lastUnit = course().units.length - 1;
    let m = maxUnit, slice = all.filter(t => t.unitIndex <= m);
    // guarantee a real pool (>=10 words) so questions vary and you meet every word
    while (slice.length < 10 && m < lastUnit) { m++; slice = all.filter(t => t.unitIndex <= m); }
    return slice.length ? slice : all;
  }
  function startBattle(rivalId) {
    const rivals = course().rivals, i = rivals.findIndex(r => r.id === rivalId); if (i < 0) return;
    const tier = tierFor(i, rivals.length), foeHp = tier.hitsToWin * BATTLE_POWER;
    const lastUnit = course().units.length - 1;
    const maxUnit = rivals.length <= 1 ? lastUnit : Math.max(0, Math.round(((i + 1) / rivals.length) * lastUnit));
    B = { rv: rivals[i], tier, pool: battlePool(maxUnit), myHp: 100, myMax: 100, foeHp, foeMax: foeHp, power: BATTLE_POWER, locked: false };
    $('#lesson').classList.remove('hidden'); nextBattleQ();
  }
  function nextBattleQ(fb) {
    const t = sample(B.pool, 1)[0];
    B.q = { term: t, options: shuffle([t, ...distractors(t, B.tier.opts - 1)]) };
    B.locked = false; renderBattle(fb);
  }
  function renderBattle(fb) {
    const myPct = Math.max(0, Math.round(100 * B.myHp / B.myMax)), foePct = Math.max(0, Math.round(100 * B.foeHp / B.foeMax));
    const q = B.q, c = course();
    $('#lesson').innerHTML = `<div class="lesson">
      <div class="lhead"><button class="close" data-action="battle-quit">✕</button>
        <div style="flex:1;text-align:center;font-weight:800;color:var(--muted)">${esc(B.rv.name)} · ${B.tier.label}</div></div>
      <div class="versus">
        <div class="vcard"><div class="av">${c.mascot}</div><div class="nm">You</div>
          <div class="vbar"><i style="width:${myPct}%"></i></div><div class="rd" style="font-weight:800">${Math.max(0, B.myHp)} HP</div></div>
        <div class="vs2">⚔️</div>
        <div class="vcard ${fb && fb.hit ? 'shake' : ''}"><div class="av">${B.rv.av}</div><div class="nm">${esc(B.rv.name)}</div>
          <div class="vbar foe"><i style="width:${foePct}%"></i></div><div class="rd" style="font-weight:800">${Math.max(0, B.foeHp)} HP</div></div>
      </div>
      <div class="qbody" style="padding:8px 2px">
        ${fb && fb.log ? `<div class="battle-log">${fb.log.map(l => `<div>${l}</div>`).join('')}</div>` : ''}
        <div class="qtitle center">Your move — what does this mean?</div>
        <div class="prompt-card" style="justify-content:center"><button class="speaker" data-action="speak" data-text="${esc(q.term.term)}">🔊</button>
          <div class="bubble">${esc(q.term.term)}${q.term.reading ? `<div class="rd">${esc(q.term.reading)}</div>` : ''}</div></div>
        <div class="choices">${q.options.map((o, i) => `<button class="choice" data-action="battle-answer" data-idx="${i}">${esc(tm(o.en))}</button>`).join('')}</div>
      </div></div>`;
    speak(q.term.term);
  }
  function battleAnswer(idx) {
    if (B.locked) return; B.locked = true;
    const q = B.q, ok = q.options[idx].id === q.term.id, log = [];
    document.querySelectorAll('#lesson .choice').forEach((c, i) => {
      c.disabled = true;
      if (q.options[i].id === q.term.id) c.classList.add('right');
      else if (i === idx) c.classList.add('wrong');
    });
    sfx(ok ? 'good' : 'bad'); buzz(ok);
    speak(q.term.term);
    if (ok) { B.foeHp -= B.power; log.push(`✅ You used <b>${esc(q.term.term)}</b>! <b>${B.power}</b> dmg`); }
    else { S.misses[q.term.id] = (S.misses[q.term.id] || 0) + 1; log.push(`❌ Missed — “${esc(q.term.term)}” means ${esc(tm(q.term.en))}`); }
    setTimeout(() => {
      if (B.foeHp <= 0) return endBattle(true);     // the winning hit costs you nothing
      // rival counters: a small chip if you were right, a big hit if you missed
      const rdmg = ok ? B.tier.chip : B.tier.big;
      B.myHp -= rdmg; log.push(`${B.rv.av} ${esc(B.rv.name)} ${ok ? 'counters' : 'strikes'} for <b>${rdmg}</b>!`);
      if (B.myHp <= 0) { renderBattle({ log, hit: true }); return setTimeout(() => endBattle(false), 600); }
      nextBattleQ({ log, hit: true });
    }, 800);
  }
  function endBattle(won) {
    sfx(won ? 'win' : 'bad');
    if (won) { S.wins = (S.wins || 0) + 1; beatenSet()[B.rv.id] = true; const reward = B.tier.label === 'Easy' ? 12 : B.tier.label === 'Medium' ? 20 : 30; S.gems += reward; S.xp += reward; S.xpWeek += reward; bumpLeague(); }
    persist(); renderTop();
    const c = course();
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      <div class="big">${won ? '🏆' : '🙂'}</div>
      <h1 style="color:${won ? 'var(--gold-d)' : 'var(--muted)'}">${won ? 'You win!' : 'Good try!'}</h1>
      <p class="center" style="color:var(--muted)">${won ? 'Your recall powered the win.' : 'Study these words, then come back stronger.'}</p>
      <div class="mt"><button class="btn" data-action="battle-quit">Back to Arena</button></div>
      ${!won ? '<div class="mt"><button class="btn ghost" data-action="study-from-battle">Go study</button></div>' : ''}</div></div>`;
    B = null;
  }

  /* ---------------- QUIZ RACE (used by tournament) ---------------- */
  let Q = null;
  function quizRace(opp, onDone, presetTerms) {
    const pool = battlePool();
    const base = presetTerms && presetTerms.length ? presetTerms : sample(pool, 5);
    const qs = base.map(t => ({ term: t, options: shuffle([t, ...distractors(t, 3)]) }));
    Q = { qs, idx: 0, me: 0, bot: 0, opp, onDone, locked: false, fixed: (opp && opp.fixedScore != null) ? opp.fixedScore : null, plan: (() => { const p = qs.map(() => Math.random() < ((opp && opp.skill) || 0.45)); if (!p.some(Boolean)) p[Math.floor(Math.random() * p.length)] = true; return p; })() };
    $('#lesson').classList.remove('hidden'); renderQuiz();
  }
  function renderQuiz() {
    if (Q.idx >= Q.qs.length) { const bot = Q.fixed != null ? Q.fixed : Q.bot; const won = Q.me >= bot; const cb = Q.onDone; $('#lesson').classList.add('hidden'); return cb(won, Q.me, bot); }
    const q = Q.qs[Q.idx];
    $('#lesson').innerHTML = `<div class="lesson">
      <div class="lhead"><button class="close" data-action="quiz-quit">✕</button>
        <div style="flex:1;text-align:center;font-weight:800;color:var(--muted)">Match · You ${Q.me} – ${Q.bot} ${esc(Q.opp.name)}</div></div>
      <div class="versus">
        <div class="vcard"><div class="av">😀</div><div class="nm">You</div><div class="rd" style="font-weight:800;margin-top:6px">${Q.me}</div></div>
        <div class="vs2">VS</div>
        <div class="vcard"><div class="av">${Q.opp.av}</div><div class="nm">${esc(Q.opp.name)}</div><div class="rd" style="font-weight:800;margin-top:6px">${Q.fixed != null ? Q.fixed : Q.bot}</div></div>
      </div>
      <div class="qbody" style="padding:8px 2px">
        <div class="qtitle center">Quick! What does this mean?</div>
        <div class="prompt-card" style="justify-content:center"><button class="speaker" data-action="speak" data-text="${esc(q.term.term)}">🔊</button>
          <div class="bubble">${esc(q.term.term)}${q.term.reading ? `<div class="rd">${esc(q.term.reading)}</div>` : ''}</div></div>
        <div class="choices">${q.options.map((o, i) => `<button class="choice" data-action="quiz-answer" data-idx="${i}">${esc(tm(o.en))}</button>`).join('')}</div>
      </div></div>`;
    speak(q.term.term);
  }
  function quizAnswer(idx) {
    if (Q.locked) return; Q.locked = true;
    const q = Q.qs[Q.idx], ok = q.options[idx].id === q.term.id;
    document.querySelectorAll('#lesson .choice').forEach((c, i) => { c.disabled = true; if (q.options[i].id === q.term.id) c.classList.add('right'); else if (i === idx) c.classList.add('wrong'); });
    if (ok) Q.me++;
    if (Q.fixed == null && Q.plan[Q.idx]) Q.bot++;   // bot's answers are pre-planned by its skill, like bosses
    speak(q.term.term);
    setTimeout(() => { Q.idx++; Q.locked = false; renderQuiz(); }, 800);
  }
  function showMatchResult(won, me, bot, opp) {
    $('#lesson').classList.remove('hidden');
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      <div class="big">${won ? '🏆' : me === bot ? '🤝' : '🙂'}</div>
      <h1 style="color:${won ? 'var(--gold-d)' : 'var(--muted)'}">${won ? 'You win!' : me === bot ? 'Tie game!' : 'Good game'}</h1>
      <p class="center" style="color:var(--muted)">You ${me} — ${bot} ${opp.av || ''} ${esc(opp.name)}</p>
      <div class="mt"><button class="btn" data-action="quiz-quit">Back to Arena</button></div></div></div>`;
  }
  let INBOX = [];
  function loadInbox() {
    if (!sbUid()) return;
    fetch(SB_URL + '/rest/v1/matches?select=id,host,term_ids,host_score,course&guest=eq.' + sbUid() + '&guest_score=is.null&order=created_at.desc&limit=5',
      { headers: sbH(CLOUD.session.access_token) })
      .then(r => r.ok ? r.json() : []).then(async ms => {
        INBOX = ms; const d = $('#fr-inbox'); if (!d || !ms.length) return;
        const ids = [...new Set(ms.map(m => m.host))]; const names = {};
        try { (await fetch(SB_URL + '/rest/v1/profiles?select=id,name&id=in.(' + ids.join(',') + ')',
          { headers: sbH(CLOUD.session.access_token) }).then(r => r.json())).forEach(p => { names[p.id] = p.name; }); } catch {}
        d.innerHTML = '<div class="seg-label">📬 Challenges for you</div>' + ms.map(m =>
          `<div class="frow"><div class="fav">🎯</div><div class="fnm">${esc(names[m.host] || 'A friend')} scored ${m.host_score}/5 — beat it!</div>
           <button class="btn sm" data-action="play-inbox" data-id="${m.id}">Play</button></div>`).join('');
      }).catch(() => {});
  }
  function challengeFriend(id) {
    ensureFriends();
    const f = S.friends.find(x => x.id === id); if (!f) return;
    if ((f.id || '').length > 20 && sbUid()) {          // real friend → device-to-device
      const picks = sample(battlePool(), 5);
      quizRace({ name: f.name, av: f.av, fixedScore: 0 }, async (won, me) => {
        await sbCreateMatch(picks.map(p => p.id), me, f.id);
        const L = $('#lesson'); L.classList.remove('hidden');
        L.innerHTML = `<div class="lesson"><div class="complete"><div class="big">📬</div><h1>Challenge sent!</h1>
          <p class="center" style="color:var(--muted)">You scored <b>${me}/5</b>. ${esc(f.name)} will find it in Arena → Friends on their device — same words, higher score wins.</p>
          <div class="mt"><button class="btn" data-action="quiz-quit">Done</button></div></div></div>`;
      }, picks);
      return;
    }
    quizRace({ name: f.name, av: f.av, skill: f.skill || 0.45 }, (won, me, bot) => {
      if (won) { S.gems += 8; S.xp += 10; S.xpWeek += 10; }
      f.xp = (f.xp || 0) + rand(2, 8); persist(); renderTop();
      showMatchResult(won, me, bot, f);
    });
  }
  /* Real async head-to-head: host plays, gets a CODE; friend plays the same
     words on their device; higher score wins. No server needed. */
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const dec = s => JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/[\s\r\n]+/g, '')))));
  function createChallenge() {
    const pool = battlePool(); const picks = sample(pool, 5);
    quizRace({ name: 'your friend', av: '🧑' }, async (won, me) => {
      const mid = sbUid() ? await sbCreateMatch(picks.map(p => p.id), me) : null;
      const code = enc({ c: S.courseId, ids: picks.map(p => p.id), n: S.displayName || 'a friend', s: me, m: mid });
      $('#lesson').classList.add('hidden');
      $('#modal').removeAttribute('hidden');
      $('#modal-body').innerHTML = `<h2>🌐 Challenge sent!</h2><p>You scored <b>${me}/5</b>. Send this code to a friend — they play the same words, higher score wins.</p>
        <textarea class="tinput" id="chalCode" style="height:90px;text-align:left;font-size:12px" readonly>${esc(code)}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px"><button class="btn sm" data-action="copy-code">Copy code</button><button class="btn sm flat" data-action="close-modal">Done</button></div>
        <p class="note">Tip: this works across devices — paste it in “Have a code?” on theirs.</p>`;
    }, picks);
  }
  function joinChallenge() {
    $('#modal').removeAttribute('hidden');
    $('#modal-body').innerHTML = `<h2>🌐 Join a challenge</h2><p>Paste your friend’s code below (spaces/line breaks are fine).</p>
      <textarea id="joinCode" class="tinput" style="height:100px;text-align:left;font-size:12px" placeholder="paste code here…"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn sm" data-action="join-go">Play</button>
      <button class="btn sm flat" data-action="close-modal">Cancel</button></div>`;
    setTimeout(() => { const t = $('#joinCode'); if (t) t.focus(); }, 50);
  }
  function playJoinedCode(raw) {
    let data; try { data = dec(raw); } catch { return toast('That code looks invalid'); }
    if (!data || !data.ids) return toast('That code looks invalid');
    if (COURSES[data.c]) { S.courseId = data.c; applyTheme(); renderTop(); }
    const terms = allTerms(data.c || S.courseId).filter(t => data.ids.includes(t.id));
    if (terms.length < 2) return toast('Couldn’t load those words');
    quizRace({ name: data.n || 'a friend', av: '🧑', fixedScore: data.s || 0 }, (won, me, bot) => {
      if (data.m) sbAnswerMatch(data.m, me);
      if (won) { S.gems += 10; S.xp += 12; S.xpWeek += 12; persist(); renderTop(); }
      showMatchResult(won, me, bot, { name: data.n || 'a friend', av: '🧑' });
    }, terms);
  }

  /* ---------------- PLACEMENT TEST (start at your level) ---------------- */
  let P = null;
  function startPlacement() {
    const units = course().units;
    const qs = units.map((u, ui) => {
      const term = u.lessons.flatMap(l => l.terms).find(t => t.card) || u.lessons[0].terms[0];
      return { ui, term, options: shuffle([term, ...distractors(term, 3)]) };
    });
    P = { qs, idx: 0, reached: 0, missStreak: 0, locked: false };
    $('#lesson').classList.remove('hidden'); renderPlacement();
  }
  function renderPlacement() {
    if (P.idx >= P.qs.length || P.missStreak >= 2) return finishPlacement();
    const q = P.qs[P.idx];
    $('#lesson').innerHTML = `<div class="lesson">
      <div class="lhead"><button class="close" data-action="placement-quit">✕</button>
        <div class="lbar"><i style="width:${Math.round(P.idx / P.qs.length * 100)}%"></i></div>
        <div class="lhearts">📏 Placement</div></div>
      <div class="qbody">
        <div class="qtitle">Quick check — what does this mean?</div>
        <div class="prompt-card"><button class="speaker" data-action="speak" data-text="${esc(q.term.term)}">🔊</button>
          <div class="bubble">${esc(q.term.term)}${q.term.reading ? `<div class="rd">${esc(q.term.reading)}</div>` : ''}</div></div>
        <div class="choices">${q.options.map((o, i) => `<button class="choice" data-action="placement-answer" data-idx="${i}"><span class="em">${o.emoji}</span>${esc(tm(o.en))}</button>`).join('')}</div>
      </div>
      <div class="lesson-deco">${course().mascot}</div></div>`;
    speak(q.term.term);
  }
  function placementAnswer(idx) {
    if (P.locked) return; P.locked = true;
    const q = P.qs[P.idx], ok = q.options[idx].id === q.term.id;
    document.querySelectorAll('#lesson .choice').forEach((c, i) => { c.disabled = true; if (q.options[i].id === q.term.id) c.classList.add('right'); else if (i === idx) c.classList.add('wrong'); });
    if (ok) { P.reached = q.ui + 1; P.missStreak = 0; } else P.missStreak++;
    setTimeout(() => { P.idx++; P.locked = false; renderPlacement(); }, 700);
  }
  function finishPlacement() {
    const units = course().units, reached = P.reached;
    for (let ui = 0; ui < reached; ui++) units[ui].lessons.forEach(l => { if (!S.done[l.id]) S.done[l.id] = 1; });
    persist();
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      <div class="big">📏</div><h1>Placed!</h1>
      <p class="center" style="color:var(--muted)">${reached === 0
        ? "We'll start you at the beginning — a perfect fresh start."
        : `Nice — you tested out of <b>${reached}</b> unit${reached > 1 ? 's' : ''}. Jumping you ahead so you start where you belong.`}</p>
      <div class="mt"><button class="btn" data-action="placement-done">Go to my path</button></div></div></div>`;
    P = null;
  }

  /* ---------------- Friends / Tournament data ---------------- */
  const BOT_NAMES = ['Mei', 'Diego', 'Yuki', 'Liam', 'Sofía', 'Kenji', 'Aisha', 'Noah', 'Lena', 'Hugo', 'Priya', 'Marco'];
  const BOT_AV = ['🦁', '🐯', '🐸', '🦄', '🐧', '🦉', '🐙', '🦊', '🐨', '🐵', '🦋', '🐢'];
  function ensureFriends() { if (!S.friends) { S.friends = [{ id: 'f1', name: 'Ava', av: '🦉', xp: rand(60, 180), skill: 0.4 }, { id: 'f2', name: 'Leo', av: '🐯', xp: rand(60, 180), skill: 0.55 }]; persist(); } }
  function addFriend() {
    ensureFriends();
    const n = prompt('Friend name or invite code:'); if (!n) return;
    S.friends.push({ id: 'f' + Date.now(), name: n.slice(0, 14), av: sample(BOT_AV, 1)[0], xp: rand(20, 160), skill: rand(30, 65) / 100 });
    persist(); renderArena(); toast('Friend added');
  }
  function removeFriend(id) { S.friends = (S.friends || []).filter(f => f.id !== id); persist(); renderArena(); }
  const randBot = () => ({ id: 'b' + rand(1, 9999), name: sample(BOT_NAMES, 1)[0], av: sample(BOT_AV, 1)[0], xp: rand(20, 160) });
  function startTourney() {
    ensureFriends();
    const pool = shuffle([...S.friends.map(f => ({ ...f })), randBot(), randBot(), randBot()]);
    const oppA = pool[0], b = pool[1], c = pool[2];
    const finalist = Math.random() < 0.5 ? b : c;
    S.tourney = { oppA, finalist, semiB: { a: b.name, b: c.name }, semiBav: b.av, semiCav: c.av, stage: 'semi', youWonSemi: false, champ: null };
    persist(); arenaTab = 'tourney'; renderArena();
  }
  function tourneyPlay() {
    const t = S.tourney; const opp = t.stage === 'final' ? t.finalist : t.oppA;
    quizRace({ name: opp.name, av: opp.av, skill: 0.42 }, won => {
      if (t.stage === 'semi') {
        t.youWonSemi = won;
        if (won) t.stage = 'final';
        else { t.stage = 'done'; t.champ = { ...t.finalist }; }   // finalist wins the cup
      } else {
        t.stage = 'done';
        if (won) { t.champ = { name: 'You', av: '😀', me: true }; S.gems += 40; S.xp += 40; S.xpWeek += 40; bumpLeague(); }
        else t.champ = { ...t.finalist };
      }
      persist(); renderTop(); arenaTab = 'tourney'; go('battle');
    });
  }

  /* ---------------- LEAGUE (weekly flavour) ---------------- */
  function bumpLeague() { ensureFriends(); S.friends.forEach(f => f.xp += rand(0, 4)); persist(); }

  /* ---------------- PROFILE ---------------- */
  function renderProfile() {
    const c = course();
    const doneCount = Object.keys(S.done).length, rivals = Object.keys(beatenSet()).length;
    const root = $('#scr-me'); root.innerHTML = '';
    root.appendChild(el('div', 'section-head', `<h1>${c.mascot} ${tr('me_title')}</h1><p>${tl('Learning')} ${c.name}</p>`));
    root.appendChild(el('div', 'pad', `
      <div class="reward-row" style="justify-content:flex-start">
        <div class="reward"><div class="rk">${tl('Total XP')}</div><div class="rv">${S.xp}</div></div>
        <div class="reward"><div class="rk">${tl('Streak')}</div><div class="rv">${S.streak}🔥</div></div>
        <div class="reward"><div class="rk">${tl('Lessons')}</div><div class="rv">${doneCount}</div></div>
        <div class="reward"><div class="rk">${tl('Rivals beat')}</div><div class="rv">${rivals}</div></div>
      </div>
      <div class="mt"><button class="btn sky" data-action="open-langpicker">🌍 ${tl('Learn a language')} (${Object.keys(COURSES).length})</button></div>
      <div class="mt"><button class="btn ghost" data-action="open-uilang">🗣️ ${tl('App language')}: ${UILANGS[S.uiLang] ? UILANGS[S.uiLang].name : 'English'}</button></div>
      <div class="mt"><button class="btn ghost" data-action="start-placement">📏 ${tl('Placement test — start at your level')}</button></div>
      <div class="settings-card mt"><div class="seg-label">☁️ ${tl('Cloud account')}</div>
        <p class="note" style="margin:4px 0 0">${sbUid()
          ? '🟢 ' + tl('Connected') + ' — ' + esc(S.displayName || 'Learner') + ' · ' + tl('progress syncs across devices')
          : (CLOUD.err === 'anonymous_provider_disabled'
            ? '🟠 ' + tl('One step left') + ': Supabase → Authentication → Sign In / Providers → enable “Allow anonymous sign-ins”, then reload.'
            : '⚪ ' + tl('Offline') + (CLOUD.err ? ' (' + esc(String(CLOUD.err)) + ')' : ''))}</p></div>
      <div class="mt"><button class="btn gold" data-action="buy-freeze">🧊 ${tl('Streak freeze')} (${S.freeze || 0}) — 30 💎</button></div>
      <div class="mt"><button class="btn ghost" data-action="toggle-sound">🔊 ${tl('Sound effects')}: ${S.sound !== false ? tl('On') : tl('Off')}</button></div>

      <div class="settings-card mt">
        <div class="seg-label">🔊 ${tl('Voice — cloud TTS')}</div>
        <p class="note" style="margin:4px 0 8px">${S.ttsKey
          ? '✅ Cloud voice <b>on</b> — perfect pronunciation in every language.'
          : 'Off — using your device voices (quality varies; some languages like Urdu may be silent). Paste a Google Cloud Text-to-Speech API key for studio-quality audio everywhere.'}</p>
        <input id="ttsKey" class="tinput" style="text-align:left;font-size:15px" type="password" placeholder="Google Cloud TTS API key…" value="${esc(S.ttsKey || '')}">
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn sm" data-action="tts-save">${tl('Save')}</button>
          <button class="btn sm ghost" data-action="tts-test">${tl('Test')}</button>
          ${S.ttsKey ? '<button class="btn sm flat" data-action="tts-clear">Turn off</button>' : ''}
        </div>
        <p class="note" style="margin-top:8px">Get a key at <b>console.cloud.google.com</b> → enable “Cloud Text-to-Speech API”. Stored only on this device. Restrict the key to that API.</p>
      </div>

      <div class="mt"><button class="btn flat" data-action="reset">${tl('Reset progress')}</button></div>
      <p class="center" style="color:var(--muted);font-size:13px;margin-top:20px">${BRAND} · ${TAGLINE} · ${tl('installable as an app')}</p>`));
  }

  /* ---------------- Language picker ---------------- */
  const REGION_ORDER = ['East Asia', 'Southeast Asia', 'South Asia', 'Middle East', 'Europe', 'Americas', 'Africa'];
  function openLangPicker() {
    $('#modal').removeAttribute('hidden');
    const byRegion = {};
    Object.values(COURSES).forEach(c => { const r = c.region || 'Other'; (byRegion[r] = byRegion[r] || []).push(c); });
    const regions = [...REGION_ORDER.filter(r => byRegion[r]), ...Object.keys(byRegion).filter(r => !REGION_ORDER.includes(r))];
    const body = regions.map(r => `<div class="region-label">${esc(r)}</div>` +
      byRegion[r].map(c => `<button class="lang-opt ${c.id === S.courseId ? 'active' : ''}" data-action="set-lang" data-id="${c.id}">
        <span class="fl">${c.flag}</span><span>${c.name} ${c.mascot}<small>${c.native} · ${c.units.length} unit${c.units.length > 1 ? 's' : ''} · lives ${c.lives ? c.lives.icon : '🏮'}</small></span></button>`).join('')).join('');
    $('#modal-body').innerHTML = `<h2>Choose a language to learn</h2><p>Grouped by world region. Each has its own animal, theme & bosses.</p>
      <div class="lang-scroll">${body}</div>
      <button class="btn flat mt" data-action="close-modal">Close</button>`;
  }
  function openUiLang() {
    $('#modal').removeAttribute('hidden');
    $('#modal-body').innerHTML = `<h2>App language</h2><p>Use the whole app in your language — you don’t need to know English to learn.</p>
      <div class="lang-scroll">${Object.entries(UILANGS).map(([id, u]) =>
        `<button class="lang-opt ${id === S.uiLang ? 'active' : ''}" data-action="set-uilang" data-id="${id}"><span class="fl">${u.flag}</span><span>${u.name}</span></button>`).join('')}</div>
      <p class="note">Menus & buttons are translated. Word <i>meanings</i> are still shown in English for now.</p>
      <button class="btn flat mt" data-action="close-modal">Close</button>`;
  }

  /* ---------------- helpers ---------------- */
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['ʼ\s]/g, '').toLowerCase().trim(); }
  let toastT; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800); }

  /* ---------------- ONE delegated click handler ---------------- */
  document.addEventListener('click', e => {
    const node = e.target.closest('[data-action]'); if (!node) return;
    const a = node.dataset;
    switch (a.action) {
      case 'nav': go(a.id); break;
      case 'start-lesson': startLesson(a.id); break;
      case 'lesson-check': lessonCheck(); break;
      case 'lesson-next': nextStep(); break;
      case 'lesson-quit': exitLesson(); break;
      case 'refill-lanterns': if (S.gems >= 20) { S.gems -= 20; S.lanterns = S.lanternsMax; persist(); renderTop(); renderStep(); } else toast('Not enough gems'); break;
      case 'choose': onChoose(+a.idx); break;
      case 'match': onMatch(a.side, +a.idx); break;
      case 'speak': speak(a.text, a.lang); break;
      case 'study-set': {
        const cur = a.key === 'deck' ? S.studyDeck : a.key === 'front' ? S.studyFront : S.studyMode;
        if (cur === a.val) break;                                   // clicking the active tab does nothing
        S['study' + a.key[0].toUpperCase() + a.key.slice(1)] = a.val;
        buildStudy(a.key === 'deck');                               // reset position only when the deck changes
        persist(); renderStudy();
        break;
      }
      case 'study-flip': ST.flipped = !ST.flipped; $('#study-wrap .flip').classList.toggle('flipped', ST.flipped); break;
      case 'study-next': studyMove(1); break;
      case 'study-prev': studyMove(-1); break;
      case 'study-shuffle': ST.deck = shuffle(ST.deck); ST.fronts = ST.deck.map((_, i) => S.studyMode === 'alt' ? frontOptions()[i % frontOptions().length] : safeFront()); ST.idx = 0; ST.flipped = false; renderStudyCard(); toast('Shuffled'); break;
      case 'study-speak': speak(ST.deck[ST.idx].term); break;
      case 'study-from-battle': $('#lesson').classList.add('hidden'); B = null; go('study'); break;
      case 'arena-tab': arenaTab = a.id; renderArena(); break;
      case 'start-battle': startBattle(a.id); break;
      case 'battle-answer': battleAnswer(+a.idx); break;
      case 'battle-quit': $('#lesson').classList.add('hidden'); B = null; go('battle'); break;
      case 'add-friend': addFriend(); break;
      case 'remove-friend': removeFriend(a.id); break;
      case 'challenge-friend': challengeFriend(a.id); break;
      case 'bot-race': quizRace({ name: 'Bot', av: '🤖', skill: +a.skill }, (won, me, bot) => { if (won) { S.gems += 6; S.xp += 8; S.xpWeek += 8; persist(); renderTop(); } showMatchResult(won, me, bot, { name: 'Bot', av: '🤖' }); }); break;
      case 'play-inbox': { const m = INBOX.find(x => x.id === a.id); if (!m) break;
        if (COURSES[m.course]) { S.courseId = m.course; applyTheme(); renderTop(); }
        const terms = allTerms(m.course).filter(t => (m.term_ids || []).includes(t.id));
        if (terms.length < 2) { toast('Could not load that match'); break; }
        quizRace({ name: 'their score', av: '🎯', fixedScore: m.host_score || 0 }, (won, me, bot) => {
          sbAnswerMatch(m.id, me);
          if (won) { S.gems += 10; S.xp += 12; S.xpWeek += 12; persist(); renderTop(); }
          showMatchResult(won, me, bot, { name: 'your friend', av: '🎯' });
        }, terms); break; }
      case 'create-challenge': createChallenge(); break;
      case 'join-challenge': joinChallenge(); break;
      case 'join-go': { const t = $('#joinCode'); const raw = (t && t.value || '').trim(); $('#modal').setAttribute('hidden', ''); if (raw) playJoinedCode(raw); break; }
      case 'edit-name': { const n = prompt('Your display name:', S.displayName || ''); if (n != null) { S.displayName = n.trim().slice(0, 18); persist(); renderArena(); renderTop(); sbSync(); } break; }
      case 'copy-mycode': { const ta = $('#myCode'); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value); } catch {} document.execCommand && document.execCommand('copy'); toast('Friend code copied'); } break; }
      case 'add-by-code': { const raw = prompt('Paste your friend’s code:'); if (!raw) break; let d; try { d = dec(raw); } catch { toast('Invalid code'); break; } if (!d || d.ww !== 'friend') { toast('Invalid friend code'); break; } if ((S.friends || []).some(f => f.id === d.id)) { toast('Already friends'); break; } ensureFriends();
        const isCloud = (d.id || '').length > 20;
        S.friends.push({ id: d.id || 'f' + Date.now(), name: (d.n || 'Friend').slice(0, 18), av: sample(BOT_AV, 1)[0], xp: 0, skill: 0.45, live: isCloud });
        if (isCloud && sbUid()) fetch(SB_URL + '/rest/v1/friends', { method: 'POST', headers: sbH(CLOUD.session.access_token), body: JSON.stringify({ a: sbUid(), b: d.id }) }).catch(() => {});
        persist(); renderArena(); toast('Added ' + (d.n || 'friend') + (isCloud ? ' 🟢 (live)' : '')); break; }
      case 'copy-code': { const ta = $('#chalCode'); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value); } catch {} document.execCommand && document.execCommand('copy'); toast('Code copied'); } break; }
      case 'start-tourney': startTourney(); break;
      case 'tourney-play': tourneyPlay(); break;
      case 'reset-tourney': S.tourney = null; persist(); renderArena(); break;
      case 'quiz-answer': quizAnswer(+a.idx); break;
      case 'quiz-quit': $('#lesson').classList.add('hidden'); Q = null; go('battle'); break;
      case 'start-placement': $('#modal').setAttribute('hidden', ''); startPlacement(); break;
      case 'placement-answer': placementAnswer(+a.idx); break;
      case 'placement-quit': $('#lesson').classList.add('hidden'); P = null; go('learn'); break;
      case 'placement-done': $('#lesson').classList.add('hidden'); P = null; go('learn'); break;
      case 'open-langpicker': openLangPicker(); break;
      case 'open-uilang': openUiLang(); break;
      case 'set-uilang': S.uiLang = a.id; persist(); $('#modal').setAttribute('hidden', ''); applyUiLang(); go('me'); toast('App language: ' + UILANGS[a.id].name); break;
      case 'tts-save': { const k = $('#ttsKey'); S.ttsKey = (k ? k.value : '').trim(); persist(); renderProfile(); toast(S.ttsKey ? '✅ Cloud voice on' : 'Key cleared'); if (S.ttsKey) speak(course().units[0].lessons[0].terms[0].term); break; }
      case 'tts-test': { const k = $('#ttsKey'); if (k && k.value.trim()) S.ttsKey = k.value.trim(); speak(course().units[0].lessons[0].terms[0].term); toast('Testing voice…'); break; }
      case 'tts-clear': S.ttsKey = ''; persist(); renderProfile(); toast('Cloud voice off'); break;
      case 'set-lang': S.courseId = a.id; ST = null; persist(); $('#modal').setAttribute('hidden', ''); applyTheme(); renderTop(); go('learn'); toast('Now learning ' + COURSES[a.id].name); break;
      case 'close-modal': $('#modal').setAttribute('hidden', ''); break;
      case 'quest-claim': if (S.quest && !S.quest.claimed) { S.quest.claimed = true; S.gems += 10; persist(); renderTop(); go('learn'); toast('🎯 +10 💎'); } break;
      case 'buy-freeze': if (S.gems >= 30) { S.gems -= 30; S.freeze = (S.freeze || 0) + 1; persist(); renderTop(); renderProfile(); toast('🧊 Streak freeze bought — auto-saves a missed day'); } else toast('Not enough gems'); break;
      case 'toggle-sound': S.sound = S.sound === false ? true : false; persist(); renderProfile(); if (S.sound) sfx('good'); break;
      case 'reset': if (confirm('Reset all progress?')) { S = fresh(); ST = null; persist(); applyTheme(); renderTop(); go('learn'); } break;
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && $('#typein') && document.activeElement === $('#typein') && L) {
      if (!L.answered) lessonCheck(); else nextStep();
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'typein') { const b = $('#checkbtn'); if (b) b.disabled = !e.target.value.trim(); }
  });

  /* ---------------- Boot ---------------- */
  if (S.lastDay !== today()) S.lanterns = S.lanternsMax;
  // streak break check: missing a full day resets the streak unless a 🧊 freeze absorbs it
  if (S.lastDay && S.lastDay !== today()) {
    const gap = Math.round((Date.parse(today()) - Date.parse(S.lastDay)) / 864e5);
    if (gap > 1) { if ((S.freeze || 0) > 0) { S.freeze--; setTimeout(() => toast('🧊 Streak freeze used — streak saved!'), 600); } else S.streak = 0; }
  }
  if (!S.myId) S.myId = 'u' + Math.random().toString(36).slice(2, 9);
  applyTheme(); applyUiLang(); renderTop(); go('learn'); persist();
  sbAuth().then(ok => { if (ok) sbSync(); });
  window.WW = { go, S };
})();
