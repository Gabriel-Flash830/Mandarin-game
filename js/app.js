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
      body: JSON.stringify({ host: sbUid(), course: S.courseId, term_ids: termIds, host_score: score == null ? null : encFinal(score), ...(guest ? { guest } : {}) }) });
      const j = await r.json(); return (r.ok && j[0]) ? j[0].id : null; } catch { return null; }
  }
  async function sbAnswerMatch(id, score) {
    if (!sbUid() || !id) return;
    await sbSync();         // matches.guest has a FK to profiles too
    fetch(SB_URL + '/rest/v1/matches?id=eq.' + encodeURIComponent(id), { method: 'PATCH',
      headers: sbH(CLOUD.session.access_token), body: JSON.stringify({ guest: sbUid(), guest_score: encFinal(score) }) }).catch(() => {});
  }
  // Live-race score codec (no schema change): while playing, a column holds an
  // IN-PROGRESS value = questionIndex*10 + score (always < 100 for <=9 Qs);
  // when finished it holds 100 + finalScore. Readers decode both cases.
  const encFinal = s => 100 + (s || 0);
  const encProgress = (qIndex, score) => qIndex * 10 + (score || 0);
  function decodeScore(v) {                    // null | {done, score, qIndex}
    if (v == null) return null;
    if (v >= 100) return { done: true, score: v - 100, qIndex: null };
    return { done: false, score: v % 10, qIndex: Math.floor(v / 10) };
  }
  function oppCellText(live) {                  // opponent VS-card / tick label
    if (!live) return '…';                      // hasn't started yet
    if (live.done) return String(live.score);
    return 'Q' + (live.qIndex + 1) + ' · ' + live.score + 'pt' + (live.score === 1 ? '' : 's');
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
  // Rainy Window: shown at boot when a 🧊 freeze absorbed a missed day.
  function showStreakSaved() {
    const c = course();
    $('#lesson').classList.remove('hidden');
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      ${celebrate(c.mascot, null, 'rainy', true)}
      <p class="center" style="color:var(--muted)">A 🧊 streak freeze kept your <b>${S.streak}</b>-day streak alive. Warm and dry — pick up right where you left off.</p>
      <div class="mt"><button class="btn" data-action="lesson-quit">Continue</button></div></div></div>`;
  }

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
  // The Thinker — just a distinguished crow HEAD with a monocle + thought bubbles.
  const TAP_SVG = `<svg viewBox="0 0 200 175" class="thsvg" xmlns="http://www.w3.org/2000/svg">
    <g class="th-think" fill="#9aa0a6">
      <circle class="th-d d1" cx="150" cy="58" r="3"/><circle class="th-d d2" cx="163" cy="44" r="3.7"/><circle class="th-d d3" cx="177" cy="28" r="4.5"/>
    </g>
    <g class="th-head">
      <path d="M64 46 C68 30 80 26 88 31 C84 41 83 52 85 60 Z" fill="#0d1319"/>
      <path d="M120 44 C116 28 104 24 96 29 C100 39 101 50 99 58 Z" fill="#0d1319"/>
      <circle cx="96" cy="98" r="55" fill="#141a20"/>
      <ellipse cx="78" cy="80" rx="23" ry="17" fill="#26384a" opacity=".32"/>
      <path d="M138 100 L173 109 L140 121 Z" fill="#f4c542"/>
      <path d="M138 109 L166 112 L140 117 Z" fill="#d9a521"/>
      <path d="M72 70 C86 60 105 60 119 68" stroke="#0a0f14" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="112" cy="90" r="8" fill="#fff"/><circle cx="114" cy="91" r="4" fill="#222"/>
      <circle class="th-mono" cx="112" cy="90" r="16" fill="none" stroke="#e8b13a" stroke-width="3.5"/>
      <path d="M118 106 C122 124 113 136 99 141" stroke="#e8b13a" stroke-width="2.2" fill="none"/>
    </g>
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
  // Frozen crow: icicles, shivering, hugging himself — shown on a chilling score.
  const FROZEN_SVG = `<svg viewBox="0 0 240 180" class="frsvg" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="180" rx="14" fill="#dceefb"/>
    <circle class="fr-sn" cx="40" cy="20" r="3" fill="#fff"/><circle class="fr-sn s2" cx="110" cy="10" r="2.5" fill="#fff"/>
    <circle class="fr-sn s3" cx="180" cy="24" r="3" fill="#fff"/><circle class="fr-sn s4" cx="220" cy="8" r="2" fill="#fff"/>
    <circle class="fr-sn s5" cx="70" cy="6" r="2.5" fill="#fff"/>
    <rect y="164" width="240" height="16" rx="8" fill="#eaf6ff"/>
    <g class="fr-crow">
      <ellipse cx="120" cy="118" rx="34" ry="40" fill="#14191f"/>
      <path d="M92 108 C104 124 136 124 148 108 C142 134 98 134 92 108 Z" fill="#0d1319"/>
      <path d="M90 100 C108 92 132 92 150 100 C142 114 98 114 90 100 Z" fill="#233242"/>
      <g class="fr-head">
        <circle cx="120" cy="66" r="27" fill="#14191f"/>
        <path d="M144 62 L166 68 L144 74 Z" fill="#e0b53a"/>
        <path d="M148 74 l3 10 l4 -9 M156 73 l2 8 l4 -7" stroke="#bfe6ff" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="128" cy="58" r="6.5" fill="#fff"/><circle cx="129" cy="60" r="3" fill="#222"/>
        <path d="M104 50 l4 12 l5 -11 M96 58 l3 10 l5 -9" stroke="#bfe6ff" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>
      <ellipse class="fr-breath" cx="172" cy="60" rx="8" ry="5" fill="#fff" opacity="0"/>
      <rect x="108" y="156" width="5" height="9" rx="2" fill="#e0b53a"/><rect x="126" y="156" width="5" height="9" rx="2" fill="#e0b53a"/>
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
  // STORYBOARD SCENES — hand-built SVG+CSS (never raw Lottie), one per trigger.
  // First Flight: nest on a branch, chick wobbles, frantic flaps, first flight.
  const FF_SVG = `<svg viewBox="0 0 340 190" class="ffsvg" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="ffsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd9a0"/><stop offset=".55" stop-color="#ffe9c4"/><stop offset="1" stop-color="#fff6e3"/></linearGradient></defs>
    <rect width="340" height="190" rx="14" fill="url(#ffsky)"/>
    <circle cx="286" cy="40" r="22" fill="#ffb347" opacity=".9"/><circle cx="286" cy="40" r="30" fill="#ffb347" opacity=".25"/>
    <g class="ff-cloud1" opacity=".8"><ellipse cx="60" cy="36" rx="30" ry="8" fill="#fff"/><ellipse cx="82" cy="31" rx="18" ry="6" fill="#fff"/></g>
    <g class="ff-cloud2" opacity=".6"><ellipse cx="180" cy="60" rx="26" ry="7" fill="#fff"/></g>
    <path d="M-4 170 C40 138 80 150 112 158 C100 166 60 176 -4 188 Z" fill="#6b4a2f"/>
    <path d="M-4 176 C50 152 96 158 128 166 L128 172 C80 178 30 184 -4 190 Z" fill="#57391f"/>
    <g class="ff-leaves" fill="#7fae5a"><ellipse cx="30" cy="140" rx="16" ry="8" transform="rotate(-18 30 140)"/><ellipse cx="66" cy="146" rx="14" ry="7" transform="rotate(-8 66 146)"/><ellipse cx="14" cy="156" rx="12" ry="7"/></g>
    <g class="ff-nest"><path d="M84 154 C84 168 122 168 122 154 C122 148 116 144 103 144 C90 144 84 148 84 154 Z" fill="#8a6236"/>
      <path d="M86 152 C96 156 110 156 120 152" stroke="#5f3f1d" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M88 158 C98 162 108 162 118 158" stroke="#6d4a24" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <g class="ff-feather f1"><path d="M0 0 C4 4 4 10 0 14 C-4 10 -4 4 0 0 Z" fill="#2b3742"/></g>
    <g class="ff-feather f2"><path d="M0 0 C3 3 3 8 0 11 C-3 8 -3 3 0 0 Z" fill="#3b4956"/></g>
    <g class="ff-feather f3"><path d="M0 0 C3 3 3 8 0 11 C-3 8 -3 3 0 0 Z" fill="#2b3742"/></g>
    <g class="ff-flyer">
      <g class="ff-wob">
        <g class="ff-wingF"><path d="M96 128 C84 120 72 120 62 128 C72 136 84 138 96 132 Z" fill="#0f151b"/></g>
        <ellipse cx="103" cy="128" rx="13" ry="16" fill="#161d24"/>
        <path d="M96 146 L100 152 L104 146 Z" fill="#161d24"/>
        <g class="ff-head">
          <circle cx="108" cy="112" r="10.5" fill="#161d24"/>
          <path d="M117 110 L129 113 L117 117 Z" fill="#f4c542"/>
          <circle cx="111" cy="109" r="3.4" fill="#fff"/><circle cx="112" cy="109.5" r="1.7" fill="#20303e"/>
          <path d="M101 103 C104 99 110 98 113 100 C110 101 106 103 104 106 Z" fill="#0d1319"/>
        </g>
        <g class="ff-wingB"><path d="M108 128 C120 120 132 120 142 128 C132 136 120 138 108 132 Z" fill="#0a0f14"/></g>
      </g>
    </g>
  </svg>`;
  // The Library: candle-lit shelves, the crow slides a glowing book home, dust motes.
  const LB_SVG = `<svg viewBox="0 0 340 190" class="lbsvg" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="lbwall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a1c12"/><stop offset="1" stop-color="#3a2818"/></linearGradient>
      <radialGradient id="lbglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <rect width="340" height="190" rx="14" fill="url(#lbwall)"/>
    <g fill="#20140b"><rect x="18" y="18" width="130" height="10" rx="2"/><rect x="18" y="70" width="130" height="10" rx="2"/><rect x="18" y="122" width="130" height="10" rx="2"/>
      <rect x="192" y="18" width="130" height="10" rx="2"/><rect x="192" y="70" width="130" height="10" rx="2"/><rect x="192" y="122" width="130" height="10" rx="2"/></g>
    <g><rect x="24" y="30" width="10" height="40" fill="#8a4b3a"/><rect x="36" y="34" width="9" height="36" fill="#4a6741"/><rect x="47" y="30" width="11" height="40" fill="#3d5a80"/><rect x="60" y="36" width="8" height="34" fill="#9a7b4f"/><rect x="70" y="30" width="10" height="40" fill="#6d3f5b"/><rect x="82" y="34" width="9" height="36" fill="#8a4b3a"/><rect x="93" y="30" width="10" height="40" fill="#4a6741"/><rect x="105" y="36" width="9" height="34" fill="#3d5a80"/><rect x="116" y="30" width="10" height="40" fill="#9a7b4f"/><rect x="128" y="34" width="9" height="36" fill="#6d3f5b"/></g>
    <g><rect x="198" y="30" width="10" height="40" fill="#4a6741"/><rect x="210" y="34" width="9" height="36" fill="#6d3f5b"/><rect x="221" y="30" width="11" height="40" fill="#9a7b4f"/><rect x="234" y="36" width="8" height="34" fill="#8a4b3a"/><rect x="244" y="30" width="10" height="40" fill="#3d5a80"/><rect x="256" y="34" width="9" height="36" fill="#4a6741"/><rect x="267" y="30" width="10" height="40" fill="#6d3f5b"/><rect x="279" y="36" width="9" height="34" fill="#9a7b4f"/><rect x="290" y="30" width="10" height="40" fill="#8a4b3a"/><rect x="302" y="34" width="9" height="36" fill="#3d5a80"/></g>
    <g><rect x="24" y="82" width="10" height="40" fill="#3d5a80"/><rect x="36" y="86" width="9" height="36" fill="#9a7b4f"/><rect x="47" y="82" width="11" height="40" fill="#8a4b3a"/><rect x="60" y="88" width="8" height="34" fill="#6d3f5b"/><rect x="70" y="82" width="10" height="40" fill="#4a6741"/><rect x="82" y="86" width="9" height="36" fill="#3d5a80"/></g>
    <g><rect x="198" y="82" width="10" height="40" fill="#8a4b3a"/><rect x="210" y="86" width="9" height="36" fill="#4a6741"/><rect x="221" y="82" width="11" height="40" fill="#6d3f5b"/><rect x="234" y="88" width="8" height="34" fill="#3d5a80"/><rect x="244" y="82" width="10" height="40" fill="#9a7b4f"/><rect x="270" y="82" width="10" height="40" fill="#4a6741"/><rect x="282" y="86" width="9" height="36" fill="#8a4b3a"/></g>
    <circle class="lb-candleglow" cx="170" cy="52" r="34" fill="url(#lbglow)"/>
    <g><rect x="165" y="52" width="10" height="18" rx="3" fill="#e8dcc8"/><path class="lb-flame" d="M170 38 C174 44 174 48 170 51 C166 48 166 44 170 38 Z" fill="#ffb347"/><path class="lb-flame f2" d="M170 42 C172 45 172 48 170 50 C168 48 168 45 170 42 Z" fill="#ffe08a"/></g>
    <g class="lb-motes" fill="#ffd27a"><circle class="lb-mote m1" cx="120" cy="80" r="1.6"/><circle class="lb-mote m2" cx="200" cy="100" r="1.3"/><circle class="lb-mote m3" cx="150" cy="120" r="1.1"/><circle class="lb-mote m4" cx="230" cy="70" r="1.4"/><circle class="lb-mote m5" cx="90" cy="105" r="1.2"/></g>
    <rect y="176" width="340" height="14" rx="6" fill="#1a0f07"/>
    <g class="lb-book"><rect x="0" y="0" width="12" height="40" rx="2" fill="#c9a227"/><rect x="2" y="4" width="8" height="6" fill="#fff3cf"/><rect class="lb-bookglow" x="-4" y="-4" width="20" height="48" rx="4" fill="#ffd27a" opacity=".35"/></g>
    <g class="lb-crow">
      <ellipse cx="262" cy="150" rx="16" ry="21" fill="#12181f"/>
      <path d="M254 168 L258 176 L263 168 Z" fill="#12181f"/>
      <rect x="252" y="168" width="5" height="9" rx="2" fill="#f4c542"/><rect x="262" y="168" width="5" height="9" rx="2" fill="#f4c542"/>
      <g class="lb-push"><path d="M252 138 C240 128 228 126 218 132 C228 142 240 146 252 144 Z" fill="#0d1319"/></g>
      <g class="lb-nod">
        <circle cx="252" cy="124" r="12.5" fill="#12181f"/>
        <path d="M241 121 L228 125 L241 129 Z" fill="#f4c542"/>
        <circle cx="247" cy="121" r="3.8" fill="#fff"/><circle cx="246" cy="121.5" r="1.9" fill="#20303e"/>
        <path class="lb-specs" d="M240 118 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" fill="none" stroke="#c9a227" stroke-width="1.4"/>
      </g>
    </g>
  </svg>`;
  // Rainy Window: rain outside, one lantern, the crow warms up with tea inside.
  const RW_SVG = `<svg viewBox="0 0 340 190" class="rwsvg" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="rwout" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16213a"/><stop offset="1" stop-color="#233150"/></linearGradient>
      <radialGradient id="rwlamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc46b" stop-opacity=".6"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></radialGradient></defs>
    <rect width="340" height="190" rx="14" fill="#4a3423"/>
    <rect x="26" y="18" width="180" height="126" rx="8" fill="url(#rwout)"/>
    <g stroke="#8fa8d9" stroke-width="1.6" stroke-linecap="round" opacity=".75">
      <g class="rw-rain r1"><line x1="46" y1="20" x2="42" y2="34"/><line x1="86" y1="26" x2="82" y2="40"/><line x1="126" y1="18" x2="122" y2="32"/><line x1="166" y1="24" x2="162" y2="38"/><line x1="66" y1="60" x2="62" y2="74"/><line x1="106" y1="66" x2="102" y2="80"/><line x1="146" y1="58" x2="142" y2="72"/><line x1="186" y1="64" x2="182" y2="78"/></g>
      <g class="rw-rain r2" opacity=".55"><line x1="56" y1="40" x2="52" y2="54"/><line x1="96" y1="46" x2="92" y2="60"/><line x1="136" y1="38" x2="132" y2="52"/><line x1="176" y1="44" x2="172" y2="58"/><line x1="76" y1="86" x2="72" y2="100"/><line x1="116" y1="92" x2="112" y2="106"/><line x1="156" y1="84" x2="152" y2="98"/></g>
    </g>
    <g class="rw-drop d1"><circle cx="60" cy="120" r="2" fill="#8fa8d9" opacity=".8"/></g>
    <g class="rw-drop d2"><circle cx="130" cy="110" r="1.7" fill="#8fa8d9" opacity=".8"/></g>
    <rect x="26" y="18" width="180" height="126" rx="8" fill="none" stroke="#2e1f12" stroke-width="8"/>
    <rect x="112" y="18" width="7" height="126" fill="#2e1f12"/><rect x="26" y="76" width="180" height="7" fill="#2e1f12"/>
    <rect x="18" y="140" width="196" height="12" rx="4" fill="#33241a"/>
    <circle class="rw-lampglow" cx="262" cy="70" r="42" fill="url(#rwlamp)"/>
    <g><rect x="258" y="34" width="8" height="10" fill="#6d4a24"/><path d="M250 44 L274 44 L270 84 L254 84 Z" fill="#b3452c"/><rect x="252" y="58" width="20" height="3" fill="#7d2f1d"/><circle class="rw-lampflame" cx="262" cy="66" r="6" fill="#ffd27a"/></g>
    <g class="rw-steam" stroke="#e8dcc8" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7">
      <path class="rw-wisp w1" d="M300 128 C296 120 304 116 300 108"/>
      <path class="rw-wisp w2" d="M310 128 C306 118 314 114 310 104"/>
    </g>
    <g><path d="M288 132 L322 132 L317 152 L293 152 Z" fill="#7ea8be"/><path d="M322 136 C330 136 330 146 321 146" fill="none" stroke="#7ea8be" stroke-width="4"/><ellipse cx="305" cy="132" rx="17" ry="3.4" fill="#5d8aa0"/></g>
    <g class="rw-crow">
      <ellipse cx="248" cy="150" rx="19" ry="24" fill="#12181f"/>
      <path d="M236 166 C230 172 230 178 236 182 L262 182 C268 178 268 172 262 166 Z" fill="#8a2f2f"/>
      <path class="rw-wing" d="M262 140 C274 134 284 136 290 144 C282 152 270 154 260 150 Z" fill="#0d1319"/>
      <g class="rw-breathe">
        <circle cx="240" cy="120" r="14.5" fill="#12181f"/>
        <path d="M228 117 L213 121 L228 126 Z" fill="#f4c542"/>
        <circle cx="235" cy="117" r="4.2" fill="#fff"/><circle class="rw-lid" cx="234" cy="117.5" r="2.1" fill="#20303e"/>
        <path d="M232 132 C238 136 246 136 252 133 L252 140 C245 143 238 143 232 140 Z" fill="#b3452c"/>
      </g>
    </g>
  </svg>`;
  // The Duel: rooftop silhouettes at dusk, cherry-blossom petals, a bow of respect.
  const DL_SVG = `<svg viewBox="0 0 340 190" class="dlsvg" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="dlsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a1f3d"/><stop offset=".6" stop-color="#7a2e4a"/><stop offset="1" stop-color="#c75146"/></linearGradient></defs>
    <rect width="340" height="190" rx="14" fill="url(#dlsky)"/>
    <circle cx="170" cy="74" r="34" fill="#ffe3c2" opacity=".92"/>
    <g fill="#1d1226">
      <path d="M-4 130 L30 130 L38 118 L46 130 L86 130 L86 190 L-4 190 Z"/>
      <path d="M254 130 L294 130 L302 118 L310 130 L344 130 L344 190 L254 190 Z"/>
      <path d="M20 130 C10 122 6 116 4 108 L14 114 L12 104 L24 112 L24 104 L34 114 C32 120 28 126 24 130 Z" opacity=".9"/>
    </g>
    <g fill="#140b1c"><rect x="86" y="150" width="168" height="40"/><path d="M70 150 L270 150 L258 138 L82 138 Z"/><path d="M60 150 C70 146 76 142 82 138 L86 150 Z"/><path d="M280 150 C270 146 264 142 258 138 L254 150 Z"/></g>
    <g class="dl-petals" fill="#f6b8c5">
      <ellipse class="dl-petal p1" cx="0" cy="0" rx="3.4" ry="2"/><ellipse class="dl-petal p2" cx="0" cy="0" rx="3" ry="1.8"/>
      <ellipse class="dl-petal p3" cx="0" cy="0" rx="3.6" ry="2.1"/><ellipse class="dl-petal p4" cx="0" cy="0" rx="2.8" ry="1.7"/>
      <ellipse class="dl-petal p5" cx="0" cy="0" rx="3.2" ry="1.9"/><ellipse class="dl-petal p6" cx="0" cy="0" rx="3" ry="1.8"/>
    </g>
    <g class="dl-crow">
      <g class="dl-bowL">
        <ellipse cx="128" cy="128" rx="15" ry="20" fill="#0d0812"/>
        <path d="M120 144 L124 152 L129 144 Z" fill="#0d0812"/>
        <circle cx="136" cy="106" r="11.5" fill="#0d0812"/>
        <path d="M146 104 L158 107 L146 111 Z" fill="#c98a2e"/>
        <path class="dl-band" d="M126 100 L146 102 L146 106 L126 104 Z" fill="#b3452c"/>
      </g>
    </g>
    <g class="dl-boss">
      <g class="dl-bowR">
        <ellipse cx="212" cy="126" rx="17" ry="22" fill="#0d0812"/>
        <path d="M204 144 L209 152 L214 144 Z" fill="#0d0812"/>
        <circle cx="203" cy="102" r="12.5" fill="#0d0812"/>
        <path d="M192 100 L180 104 L192 108 Z" fill="#c98a2e"/>
        <path d="M210 90 C216 84 224 84 228 88 C222 90 216 94 214 98 Z" fill="#0d0812"/>
        <path class="dl-tail" d="M226 138 C240 132 248 120 246 106 C238 114 230 122 224 130 Z" fill="#08040c"/>
      </g>
    </g>
  </svg>`;
  // The Samurai: a lone crow master under the moon, katana at his side, cherry
  // blossoms on the wind — staring off into the distance.
  const SAM_SVG = `<svg viewBox="0 0 340 190" class="samsvg" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="samsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#221a3a"/><stop offset=".55" stop-color="#48294f"/><stop offset="1" stop-color="#8a3f56"/></linearGradient></defs>
    <rect width="340" height="190" rx="14" fill="url(#samsky)"/>
    <circle cx="248" cy="56" r="30" fill="#f3e6c8"/>
    <circle cx="240" cy="48" r="5" fill="#ddcaa0" opacity=".55"/><circle cx="256" cy="62" r="4" fill="#ddcaa0" opacity=".5"/><circle cx="252" cy="46" r="3" fill="#ddcaa0" opacity=".4"/>
    <path d="M-4 152 L60 118 L120 152 Z" fill="#2a1e3e" opacity=".85"/>
    <path d="M96 152 L164 112 L232 152 Z" fill="#241a36" opacity=".7"/>
    <rect y="150" width="340" height="40" fill="#160f22"/>
    <path d="M0 150 Q170 143 340 150 L340 156 L0 156 Z" fill="#0f0a18"/>
    <g class="sam-tree">
      <path d="M40 152 C42 122 34 98 28 80 M28 80 C22 68 12 64 6 66 M28 80 C40 68 54 68 60 74 M34 108 C40 100 48 100 54 104" stroke="#2a1a12" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g fill="#f0a0bd"><ellipse cx="12" cy="60" rx="16" ry="11"/><ellipse cx="40" cy="52" rx="21" ry="13"/><ellipse cx="62" cy="66" rx="15" ry="10"/><ellipse cx="32" cy="72" rx="14" ry="9"/></g>
      <g fill="#f9c6d8" opacity=".85"><ellipse cx="26" cy="52" rx="9" ry="6"/><ellipse cx="52" cy="58" rx="7" ry="5"/></g>
    </g>
    <g class="sam-petals" fill="#f9c6d8">
      <ellipse class="sam-petal p1" cx="0" cy="0" rx="3.4" ry="2"/><ellipse class="sam-petal p2" cx="0" cy="0" rx="3" ry="1.8"/>
      <ellipse class="sam-petal p3" cx="0" cy="0" rx="3.6" ry="2.1"/><ellipse class="sam-petal p4" cx="0" cy="0" rx="2.8" ry="1.7"/>
      <ellipse class="sam-petal p5" cx="0" cy="0" rx="3.2" ry="1.9"/>
    </g>
    <g class="sam-crow">
      <g class="sam-sword">
        <path d="M197 126 L216 172 L211 174 L192 128 Z" fill="#cdd6de"/>
        <rect x="189" y="120" width="10" height="4" rx="2" transform="rotate(24 194 122)" fill="#c98a2e"/>
        <rect x="188" y="122" width="4" height="12" rx="2" transform="rotate(24 190 128)" fill="#2a1c12"/>
      </g>
      <path class="sam-robe" d="M168 106 C158 128 154 150 149 168 C168 162 190 162 199 168 C196 146 192 126 188 106 Z" fill="#161020"/>
      <path class="sam-hem" d="M149 168 C160 163 190 163 199 168 L199 175 C190 170 160 170 149 175 Z" fill="#0e0916"/>
      <ellipse cx="178" cy="102" rx="18" ry="22" fill="#14191f"/>
      <path d="M188 98 C197 104 199 114 197 123 C191 120 185 113 183 104 Z" fill="#0d1319"/>
      <g class="sam-head">
        <circle cx="182" cy="76" r="14" fill="#14191f"/>
        <path d="M195 74 L212 78 L195 82 Z" fill="#f4c542"/>
        <circle cx="187" cy="73" r="3.2" fill="#fff"/><circle cx="188" cy="73.5" r="1.6" fill="#20303e"/>
        <path d="M175 64 C177 55 181 53 183 54 C185 57 184 62 181 66 Z" fill="#0d1319"/>
        <path d="M170 72 L162 69 L170 78 Z" fill="#0d1319"/>
      </g>
    </g>
  </svg>`;
  // Celebration crow — hand-drawn, front-facing, feet on the ground so it levels
  // with the emoji mascot (was a Lottie crow that floated above the animal).
  const DANCE_CROW_SVG = `<svg viewBox="0 0 100 122" class="dcsvg" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#e0a52f" stroke-width="3.4" stroke-linecap="round" fill="none">
      <path d="M43 96 L41 113"/><path d="M41 113 l-6 5 M41 113 l0 6 M41 113 l6 5"/>
      <path d="M57 96 L59 113"/><path d="M59 113 l-6 5 M59 113 l0 6 M59 113 l6 5"/>
    </g>
    <ellipse cx="50" cy="70" rx="30" ry="32" fill="#141a20"/>
    <ellipse cx="43" cy="64" rx="13" ry="16" fill="#26384a" opacity=".38"/>
    <path class="dc-wingL" d="M23 58 C11 64 9 82 18 92 C26 86 31 72 33 62 Z" fill="#0d1319"/>
    <path class="dc-wingR" d="M77 58 C89 64 91 82 82 92 C74 86 69 72 67 62 Z" fill="#0d1319"/>
    <circle cx="50" cy="33" r="22" fill="#141a20"/>
    <path d="M43 13 C45 5 52 4 56 8 C51 12 49 18 49 23 Z" fill="#0d1319"/>
    <circle cx="42" cy="30" r="5.4" fill="#fff"/><circle cx="43" cy="31" r="2.7" fill="#20303e"/>
    <circle cx="58" cy="30" r="5.4" fill="#fff"/><circle cx="57" cy="31" r="2.7" fill="#20303e"/>
    <path d="M45 39 L55 39 L50 48 Z" fill="#f4c542"/>
  </svg>`;
  const crow = cls => `<span class="crow svgc ${cls || ''}">${DANCE_CROW_SVG}</span>`;
  function mountCrows() {   // kept as a no-op guard; the SVG crow needs no mounting
    document.querySelectorAll('.crow.lottie .lbox:not(.mounted)').forEach(box => {
      box.classList.add('mounted');
      const p = box.parentElement; p.classList.remove('lottie'); p.classList.add('emoji'); p.textContent = '🐦‍⬛';
    });
  }
  // auto-mount whenever a celebration renders — survives any future template edits
  new MutationObserver(() => mountCrows()).observe(document.getElementById('lesson'), { childList: true, subtree: true });

  // Staged duo celebrations: entrance → performance → sparkle. The crow and
  // the language's animal run in, land with squash-&-stretch, and perform.
  function celebrate(mascot, acc, forced, earn) {
    // forced = storyboard variant tied to a specific trigger (never random):
    // 'firstflight' first-ever lesson · 'library' unit mastered ·
    // 'rainy' streak saved by a freeze · 'duel' final boss beaten
    // earn = this is a REAL trigger (not a gallery replay) → mark it collected.
    const v = forced || ((acc != null && acc < 60) ? 'frozen' : sample(['party', 'fireworks', 'trophy', 'highfive', 'fly', 'confetti', 'night', 'mj', 'genius', 'samurai'], 1)[0]);
    if (earn) { S.celeSeen = S.celeSeen || {}; if (!S.celeSeen[v]) { S.celeSeen[v] = 1; persist(); } }
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
      genius: `<div class="cstage"><div class="thw">${TAP_SVG}</div></div>`,
      samurai: `<div class="cstage samScene">${SAM_SVG}</div>`,
      frozen: `<div class="cstage"><div class="frw">${FROZEN_SVG}</div></div>`,
      firstflight: `<div class="cstage ffScene">${FF_SVG}</div>`,
      library: `<div class="cstage lbScene">${LB_SVG}</div>`,
      rainy: `<div class="cstage rwScene">${RW_SVG}</div>`,
      duel: `<div class="cstage dlScene">${DL_SVG}</div>`,
    };
    const titles = {
      party: '🎉 You crushed it!', fireworks: '🎆 Spectacular!', trophy: '🏆 Champion run!',
      highfive: '🙌 Nailed it together!', fly: '🦸 Superhero landing!', night: '🌙 Night watch — the city can rest.', mj: '🕺 Moonwalk master!', genius: "🧐 Mastered — filed away for good.", samurai: '🌸 The way of the word — mastered.', frozen: '🥶 B-b-brrr… a chilly one. Warm up in Study!', confetti: 'You nailed it!',
      firstflight: '🐣 First flight — you’re airborne!', library: '📚 Unit mastered — shelved for good.',
      rainy: '🌧️ Streak saved — warm and dry inside.', duel: '🌸 The last boss bows. Respect.',
    };
    return `<div class="celebrate ${v}">${stages[v]}<h1 class="cmaster">${titles[v]}</h1></div>`;
  }
  function completeLesson() {
    sfx('win');
    const lesson = L.lesson, firstTime = !S.done[lesson.id], c = course();
    const firstEver = !S.ffSeen && Object.keys(S.done).length === 0;   // very first lesson, once per player
    const gainXP = 10 + L.bestCombo * 2 + (L.mistakes === 0 ? 5 : 0);
    S.done[lesson.id] = Math.max(S.done[lesson.id] || 0, L.mistakes === 0 ? 3 : L.mistakes <= 2 ? 2 : 1);
    // storyboard triggers: First Flight beats The Library; both beat the random pick
    const unit = c.units.find(u => u.lessons.some(l => l.id === lesson.id));
    const unitMastered = firstTime && unit && unit.lessons.every(l => S.done[l.id]);
    const forced = firstEver ? 'firstflight' : unitMastered ? 'library' : null;
    if (firstEver) S.ffSeen = 1;
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
    // celebratory animation (storyboard variant if a trigger fired, else random)
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      ${celebrate(c.mascot, Math.round(100 * (L.queue.length - L.mistakes) / L.queue.length), forced, true)}
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
        <div class="word" style="font-size:${glyphSize(t.term, 30, 130)}px">${esc(t.term)}</div><div class="py">${esc(t.reading || '')}</div></div>
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
  // Shrink big card text so long words (Zulu "sawubona", German, etc.) stay inside
  // the ~250px card instead of spilling out the sides. CJK glyphs are ~full-width.
  function glyphSize(text, base, maxW) {
    const s = String(text || '').trim();
    const cjk = /[぀-ヿ㐀-鿿가-힯豈-﫿]/.test(s);
    let units = 0;                              // estimated width of the WHOLE term, in font-size units
    for (const ch of s) { const c = ch.charCodeAt(0), wide = (c >= 0x3040 && c <= 0x9fff) || (c >= 0xac00 && c <= 0xd7af) || (c >= 0xf900 && c <= 0xfaff); units += /\s/.test(ch) ? 0.34 : wide ? 1.0 : 0.70; }
    const fit = (maxW || 248) / Math.max(units, 0.70);    // largest size that keeps the whole term on one line
    return Math.max(18, Math.min(base, Math.round(fit)));
  }
  function frontFace(t, front) {
    if (front === 'py') return `<div class="big-py" style="font-size:${glyphSize(t.reading || t.term, 34)}px">${esc(t.reading || t.term)}</div><div class="small-cap">${tl('tap to reveal')}</div>`;
    if (front === 'mean') return `<div class="big-en" style="font-size:${glyphSize(tm(t.en), 30)}px">${esc(tm(t.en))}</div><div class="small-cap">${tl('tap to reveal')}</div>`;
    return `<div class="topglyph" style="font-size:${glyphSize(t.term, 78)}px">${esc(t.term)}</div><div class="small-cap">${tl('tap to reveal')}</div>`;
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
            <div class="topglyph" style="font-size:${glyphSize(t.term, 54)}px">${esc(t.term)}</div>
            ${t.reading ? `<div class="big-py" style="font-size:${glyphSize(t.reading, 24)}px">${esc(t.reading)}</div>` : ''}
            <div class="big-en" style="font-size:${glyphSize(tm(t.en), 22)}px">${esc(tm(t.en))}</div>
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
    root.appendChild(el('div', 'section-head', `<h1>${tr('arena_title')}</h1><p>${tl('Battle rivals, race friends, top the boards.')}</p>`));
    const nav = el('div', 'subnav');
    [['rivals', '⚔️ ' + tl('Rivals')], ['friends', '👥 ' + tl('Friends')], ['practice', '🤖 ' + tl('Practice')], ['leaders', '🏆 ' + tl('Ranks')]].forEach(([id, label]) => {
      nav.innerHTML += `<button data-action="arena-tab" data-id="${id}" class="${arenaTab === id ? 'on' : ''}">${label}</button>`;
    });
    root.appendChild(nav);
    if (arenaTab === 'rivals') renderRivals(root);
    else if (arenaTab === 'friends') renderFriends(root);
    else if (arenaTab === 'practice') renderPractice(root);
    else renderLeaderboards(root);
  }
  // pull real friends' latest name + weekly XP from the cloud, then re-render
  function syncCloudFriends(cb) {
    const cloudIds = (S.friends || []).filter(f => (f.id || '').length > 20).map(f => f.id);
    if (!sbUid() || !cloudIds.length) return;
    fetch(SB_URL + '/rest/v1/profiles?select=id,name,xp_week&id=in.(' + cloudIds.join(',') + ')', { headers: sbH(CLOUD.session.access_token) })
      .then(r => r.ok ? r.json() : []).then(rows => {
        let changed = false;
        rows.forEach(p => { const f = S.friends.find(x => x.id === p.id);
          if (f && (f.name !== p.name || f.xp !== p.xp_week)) { f.name = p.name; f.xp = p.xp_week; f.live = true; changed = true; } });
        if (changed) { persist(); if (cb) cb(); }
      }).catch(() => {});
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
    if (!S.displayName) setTimeout(() => toast('👤 Set your name (Edit name) so friends can tell it’s you!'), 600);
    const myCode = enc({ ww: 'friend', n: name, id: sbUid() || S.myId });
    const wrap = el('div', 'pad');
    const isReal = f => !!(f.live || (f.id || '').length > 20);
    const realFriends = (S.friends || []).filter(isReal);
    wrap.innerHTML = `<div id="fr-inbox"></div><div class="settings-card" style="margin-bottom:14px">
        <div class="seg-label">👤 Your account</div>
        <p class="note" style="margin:4px 0 8px">Name: <b>${esc(name)}</b> — share your friend code so people can add you.</p>
        <textarea class="tinput" id="myCode" style="height:56px;text-align:left;font-size:11px" readonly>${esc(myCode)}</textarea>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn sm" data-action="copy-mycode">Copy my code</button>
          <button class="btn sm ghost" data-action="edit-name">Edit name</button>
          <button class="btn sm ghost" data-action="add-by-code">＋ Add by code</button>
        </div>
      </div>
      <div class="seg-label">🟢 Your friends</div>
      ${realFriends.length ? realFriends.map(f => `<div class="frow"><div class="fav">${f.av}</div>
        <div class="fnm">${esc(f.name)} 🟢</div>
        <button class="btn sm" data-action="challenge-friend" data-id="${f.id}" style="padding:6px 10px;margin-right:4px">⚔️ Race</button>
        <button class="frm" data-action="remove-friend" data-id="${f.id}">✕</button></div>`).join('')
        : `<p class="note" style="margin:4px 0 10px">No friends yet. Tap <b>＋ Add by code</b> above and swap codes with a real friend to race. (Practice bots live on the 🤖 Practice tab; rankings on 🏆 Ranks.)</p>`}
      <div class="seg-label" style="margin-top:18px">🌐 Play across devices (a code)</div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="btn" data-action="create-challenge">Send a challenge</button>
        <button class="btn ghost" data-action="join-challenge">Have a code?</button>
      </div>
      <div class="seg-label" style="margin-top:18px">🏅 Friends tournament</div>
      <div id="fr-tourney"></div>`;
    root.appendChild(wrap);
    renderTourneyInto($('#fr-tourney'));
    syncCloudFriends(() => { if (arenaTab === 'friends') renderArena(); });
    loadInbox();
    clearInterval(window.__inboxIv);
    window.__inboxIv = setInterval(() => {
      if (arenaTab === 'friends' && document.querySelector('#fr-inbox')) loadInbox();
      else clearInterval(window.__inboxIv);
    }, 5000);
  }
  function renderPractice(root) {
    ensureFriends();
    const isReal = f => !!(f.live || (f.id || '').length > 20);
    const bots = (S.friends || []).filter(f => !isReal(f));
    const dLabel = sk => sk < 0.42 ? 'Easy' : sk < 0.58 ? 'Medium' : 'Hard';
    const dCls = sk => sk < 0.42 ? 'easy' : sk < 0.58 ? 'med' : 'hard';
    const wrap = el('div', 'pad');
    wrap.innerHTML = `<p class="note" style="margin:2px 0 12px">Warm-up races against bots — these don't earn XP or affect your ranking.</p>
      <div class="seg-label">⚡ Quick race</div>
      <div class="qrace"><button class="btn sm ghost" data-action="bot-race" data-skill="0.25">Easy</button>
        <button class="btn sm ghost" data-action="bot-race" data-skill="0.45">Medium</button>
        <button class="btn sm ghost" data-action="bot-race" data-skill="0.7">Hard</button></div>
      <div class="seg-label" style="margin-top:18px">🤖 Your practice bots</div>
      ${bots.length ? bots.map(b => `<div class="frow"><div class="fav">${b.av}</div>
        <div class="fnm">${esc(b.name)} <span class="diff ${dCls(b.skill || 0.45)}" style="margin-left:6px">${dLabel(b.skill || 0.45)}</span></div>
        <button class="btn sm" data-action="challenge-friend" data-id="${b.id}" style="padding:6px 10px;margin-right:4px">⚔️ Race</button>
        <button class="frm" data-action="remove-friend" data-id="${b.id}">✕</button></div>`).join('') : '<p class="note">No bots yet — add one below.</p>'}
      <button class="btn sky mt" data-action="add-friend">＋ Add a practice bot</button>`;
    root.appendChild(wrap);
  }
  function renderLeaderboards(root) {
    ensureFriends();
    const name = S.displayName || 'You';
    const isReal = f => !!(f.live || (f.id || '').length > 20);
    const realFriends = (S.friends || []).filter(isReal);
    const league = [{ name, av: '😀', xp: S.xpWeek, me: true }, ...realFriends].sort((a, b) => b.xp - a.xp);
    const wrap = el('div', 'pad');
    wrap.innerHTML = `<div class="seg-label">🏆 Weekly XP — you &amp; friends</div>
      ${league.map((r, i) => `<div class="frow ${r.me ? 'me' : ''}"><div class="fpos">${i + 1}</div><div class="fav">${r.av}</div>
        <div class="fnm">${esc(r.name)}${r.live ? ' 🟢' : ''}</div><div class="fxp">${r.xp} XP</div></div>`).join('')}
      ${realFriends.length ? '' : `<p class="note" style="margin:6px 0">Add friends on the 👥 Friends tab to race for weekly XP together.</p>`}
      <div class="seg-label" style="margin-top:20px">🌍 Global top 10 · everyone this week</div>
      <div id="cloud-lb" class="lb-list"><p class="note">${sbUid() ? '…' : tl('Cloud off — see Me tab')}</p></div>`;
    root.appendChild(wrap);
    syncCloudFriends(() => { if (arenaTab === 'leaders') renderArena(); });
    if (sbUid()) sbLeaderboard().then(rows => { const d = $('#cloud-lb'); if (d) d.innerHTML = rows.length
      ? rows.map((r, i) => `<div class="lb-row"><span class="lb-rank">${['🥇', '🥈', '🥉'][i] || (i + 1)}</span><span class="lb-name">${esc(r.name)}</span><span class="lb-xp">${r.xp_week} XP</span></div>`).join('')
      : '<p class="note">No players yet — you’ll appear here after your next lesson.</p>'; });
  }
  function renderTourneyInto(container) {
    if (!container) return;
    const t = S.tourney;
    if (t && t.stage === 'playing') {
      const left = Math.max(2, Math.round(t.size / Math.pow(2, t.round - 1)));
      container.innerHTML = `<div class="settings-card">
        <div class="seg-label">${t.mode === 'friends' ? '🟢 Friends' : '🤖 Open'} Cup · Round ${t.round} of ${t.totalRounds}</div>
        <p class="note" style="margin:4px 0 8px">${left} players left. Your match: <b>😀 You</b> vs <b>${t.opp.av} ${esc(t.opp.name)}</b>. Win to advance.</p>
        <button class="btn" data-action="tourney-play">Play round ${t.round} →</button>
        <button class="btn sm flat mt" data-action="reset-tourney">Quit tournament</button></div>`;
      return;
    }
    if (t && t.stage === 'done') {
      container.innerHTML = `<div class="settings-card"><div class="center" style="font-weight:800;margin:6px 0">${t.champ.me
        ? '🏆 You won the ' + (t.mode === 'friends' ? 'Friends' : 'Open') + ' Cup! +40 💎'
        : t.champ.av + ' ' + esc(t.champ.name) + ' took the Cup — get them next time.'}</div>
        <button class="btn ghost" data-action="reset-tourney">New tournament</button></div>`;
      return;
    }
    // setup
    const size = window.__tSize || 8;
    const isReal = f => !!(f.live || (f.id || '').length > 20);
    const realCount = (S.friends || []).filter(isReal).length;
    const need = size - 1 - realCount;
    const sizeBtns = [4, 6, 8, 16].map(n => `<button class="btn sm ${n === size ? '' : 'ghost'}" data-action="tourney-size" data-n="${n}" style="flex:1;padding:9px 4px">${n}</button>`).join('');
    container.innerHTML = `
      <div class="seg-label" style="margin-top:2px">Bracket size</div>
      <div style="display:flex;gap:8px;margin:6px 0 14px">${sizeBtns}</div>
      <div class="settings-card" style="margin-bottom:10px">
        <div class="seg-label">🤖 Open Cup</div>
        <p class="note" style="margin:4px 0 8px">A ${size}-player knockout, filled out with bots.</p>
        <button class="btn sm" data-action="start-tourney" data-mode="open" data-bots="0">Start Open Cup</button>
      </div>
      <div class="settings-card">
        <div class="seg-label">🟢 Friends Cup — real friends only</div>
        ${need <= 0
          ? `<p class="note" style="margin:4px 0 8px">You + ${size - 1} of your ${realCount} real friend${realCount === 1 ? '' : 's'}. No bots.</p>
             <button class="btn sm" data-action="start-tourney" data-mode="friends" data-bots="0">Start Friends Cup</button>`
          : `<p class="note" style="margin:4px 0 8px">You have <b>${realCount}</b> real friend${realCount === 1 ? '' : 's'} — a ${size}-player cup needs ${size - 1}. Add more friends (👥 Friends tab), pick a smaller size, or fill the last <b>${need}</b> ${need === 1 ? 'slot' : 'slots'} with bots.</p>
             <button class="btn sm" data-action="start-tourney" data-mode="friends" data-bots="${need}">＋ Fill ${need} with bots &amp; start</button>`}
      </div>`;
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
    const rivals = c.rivals, finalBoss = won && rivals.length && B.rv.id === rivals[rivals.length - 1].id;
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      ${finalBoss ? celebrate(c.mascot, null, 'duel', true) : `<div class="big">${won ? '🏆' : '🙂'}</div>
      <h1 style="color:${won ? 'var(--gold-d)' : 'var(--muted)'}">${won ? 'You win!' : 'Good try!'}</h1>`}
      <p class="center" style="color:var(--muted)">${finalBoss ? 'You beat the last boss on the ladder — the whole rooftop bows.' : won ? 'Your recall powered the win.' : 'Study these words, then come back stronger.'}</p>
      <div class="mt"><button class="btn" data-action="battle-quit">Back to Arena</button></div>
      ${!won ? '<div class="mt"><button class="btn ghost" data-action="study-from-battle">Go study</button></div>' : ''}</div></div>`;
    B = null;
  }

  /* ---------------- QUIZ RACE (used by tournament) ---------------- */
  let Q = null;
  function quizRace(opp, onDone, presetTerms, live) {
    const pool = battlePool();
    const base = presetTerms && presetTerms.length ? presetTerms : sample(pool, 5);
    const qs = base.map(t => ({ term: t, options: shuffle([t, ...distractors(t, 3)]) }));
    Q = { qs, idx: 0, me: 0, bot: 0, opp, onDone, locked: false, fixed: (opp && opp.fixedScore != null) ? opp.fixedScore : null, live: live || null, oppLive: null, pollIv: null, plan: (() => { const p = qs.map(() => Math.random() < ((opp && opp.skill) || 0.45)); if (!p.some(Boolean)) p[Math.floor(Math.random() * p.length)] = true; return p; })() };
    $('#lesson').classList.remove('hidden'); renderQuiz();
  }
  // --- live-race helpers: patch my column, poll the opponent's, tick the card ---
  function qLivePatch(finished) {
    if (!Q || !Q.live) return;
    sbPatchMatch(Q.live.mid, { [Q.live.mine]: finished ? encFinal(Q.me) : encProgress(Q.idx, Q.me) });
  }
  function qUpdateOppCell() {
    const el = document.getElementById('opp-score');
    if (el && Q && Q.live) el.textContent = oppCellText(Q.oppLive);
  }
  function qStartPoll() {
    if (!Q || !Q.live || Q.pollIv) return;
    const tick = async () => {
      if (!Q || !Q.live) return;
      try {
        const r = await fetch(SB_URL + '/rest/v1/matches?id=eq.' + Q.live.mid + '&select=' + Q.live.opp, { headers: sbH(CLOUD.session.access_token) });
        const row = (await r.json())[0];
        if (row) { Q.oppLive = decodeScore(row[Q.live.opp]); qUpdateOppCell(); }
      } catch {}
    };
    tick();                                   // immediate first read
    Q.pollIv = setInterval(tick, 2000);       // then every 2s
  }
  function qStopPoll() { if (Q && Q.pollIv) { clearInterval(Q.pollIv); Q.pollIv = null; } }
  function renderQuiz() {
    if (Q.idx >= Q.qs.length) {
      qStopPoll();
      if (Q.live) qLivePatch(true);                                   // publish my final = 100 + score
      const bot = Q.live ? (Q.oppLive && Q.oppLive.done ? Q.oppLive.score : 0) : (Q.fixed != null ? Q.fixed : Q.bot);
      const won = Q.me > bot; const cb = Q.onDone; $('#lesson').classList.add('hidden'); return cb(won, Q.me, bot);
    }
    const q = Q.qs[Q.idx];
    const oppDisp = Q.live ? oppCellText(Q.oppLive) : String(Q.fixed != null ? Q.fixed : Q.bot);
    $('#lesson').innerHTML = `<div class="lesson">
      <div class="lhead"><button class="close" data-action="quiz-quit">✕</button>
        <div style="flex:1;text-align:center;font-weight:800;color:var(--muted)">${Q.live ? '🔴 Live race · Q' + (Q.idx + 1) + '/' + Q.qs.length : 'Match · You ' + Q.me + ' – ' + (Q.fixed != null ? Q.fixed : Q.bot) + ' ' + esc(Q.opp.name)}</div></div>
      <div class="versus">
        <div class="vcard"><div class="av">😀</div><div class="nm">You</div><div class="rd" style="font-weight:800;margin-top:6px">${Q.me}</div></div>
        <div class="vs2">VS</div>
        <div class="vcard"><div class="av">${Q.opp.av}</div><div class="nm">${esc(Q.opp.name)}</div><div class="rd" id="opp-score" style="font-weight:800;margin-top:6px">${oppDisp}</div></div>
      </div>
      <div class="qbody" style="padding:8px 2px">
        <div class="qtitle center">Quick! What does this mean?</div>
        <div class="prompt-card" style="justify-content:center"><button class="speaker" data-action="speak" data-text="${esc(q.term.term)}">🔊</button>
          <div class="bubble">${esc(q.term.term)}${q.term.reading ? `<div class="rd">${esc(q.term.reading)}</div>` : ''}</div></div>
        <div class="choices">${q.options.map((o, i) => `<button class="choice" data-action="quiz-answer" data-idx="${i}">${esc(tm(o.en))}</button>`).join('')}</div>
      </div></div>`;
    if (Q.live) { qLivePatch(false); qStartPoll(); }                  // publish my progress + watch theirs
    speak(q.term.term);
  }
  function quizAnswer(idx) {
    if (Q.locked) return; Q.locked = true;
    const q = Q.qs[Q.idx], ok = q.options[idx].id === q.term.id;
    document.querySelectorAll('#lesson .choice').forEach((c, i) => { c.disabled = true; if (q.options[i].id === q.term.id) c.classList.add('right'); else if (i === idx) c.classList.add('wrong'); });
    if (ok) Q.me++;
    if (!Q.live && Q.fixed == null && Q.plan[Q.idx]) Q.bot++;   // bot's answers are pre-planned by its skill, like bosses
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
  async function sbPatchMatch(id, fields) {
    if (!sbUid() || !id) return;
    return fetch(SB_URL + '/rest/v1/matches?id=eq.' + encodeURIComponent(id), { method: 'PATCH',
      headers: sbH(CLOUD.session.access_token), body: JSON.stringify(fields) }).catch(() => {});
  }
  // live race: wait screen that polls until both scores exist, then shows the result
  function pollResult(mid, mine, opp) {   // mine = my RAW final score (already published encoded)
    const L = $('#lesson'); L.classList.remove('hidden');
    L.innerHTML = `<div class="lesson"><div class="complete"><div class="big">⏳</div>
      <h1>Waiting for ${esc(opp.name)}…</h1>
      <p class="center" style="color:var(--muted)">You scored <b>${mine}</b>. The result appears the moment they finish.</p>
      <p class="center" id="opp-live" style="color:var(--muted);font-weight:800;min-height:1.2em"></p>
      <div class="mt"><button class="btn ghost" data-action="quiz-quit">Check later</button></div></div></div>`;
    const oppCol = opp.iAmGuest ? 'host_score' : 'guest_score';
    let n = 0;
    const iv = setInterval(async () => {
      if (++n > 50 || L.classList.contains('hidden')) { clearInterval(iv); return; }
      try {
        const r = await fetch(SB_URL + '/rest/v1/matches?id=eq.' + mid + '&select=host_score,guest_score', { headers: sbH(CLOUD.session.access_token) });
        const m = (await r.json())[0]; if (!m) return;
        const tl = decodeScore(m[oppCol]);
        if (tl && tl.done) {
          clearInterval(iv);
          const theirs = tl.score;
          if (mine > theirs) { S.gems += 10; S.xp += 12; S.xpWeek += 12; persist(); renderTop(); }
          showMatchResult(mine > theirs, mine, theirs, opp);
        } else {
          const el = document.getElementById('opp-live');
          if (el) el.textContent = tl ? ('They’re on Q' + (tl.qIndex + 1) + ' · ' + tl.score + 'pt' + (tl.score === 1 ? '' : 's') + '…') : 'Waiting for them to start…';
        }
      } catch {}
    }, 2000);
  }
  let INBOX = [];
  // Rows older than this use the raw (pre-tick) score encoding — never show them.
  const MATCH_EPOCH = '2026-07-12T06:30:00Z';
  function loadInbox() {
    if (!sbUid()) return;
    fetch(SB_URL + '/rest/v1/matches?select=id,host,term_ids,host_score,course,created_at&guest=eq.' + sbUid() + '&or=(guest_score.is.null,guest_score.lt.100)&created_at=gt.' + MATCH_EPOCH + '&order=created_at.desc&limit=5',
      { headers: sbH(CLOUD.session.access_token) })
      .then(r => r.ok ? r.json() : []).then(async ms => {
        INBOX = ms; const d = $('#fr-inbox'); if (!d) return;
        const fresh = m => (Date.now() - Date.parse(m.created_at)) < 30 * 60000;   // abandoned races stop being "LIVE" after 30 min
        const hostLive = m => { const hs = decodeScore(m.host_score); return (!hs || !hs.done) && fresh(m); };
        if (ms.some(hostLive)) window.__inboxOpen = true;   // live race → pop open
        const head = `<button class="seg-label" data-action="toggle-inbox" style="background:none;border:none;cursor:pointer;padding:0;display:block">📬 Challenges (${ms.length}) ${window.__inboxOpen ? '▾' : '▸'}</button>`;
        if (!ms.length) { d.innerHTML = head; return; }
        if (!window.__inboxOpen) { d.innerHTML = head; return; }
        const ids = [...new Set(ms.map(m => m.host))]; const names = {};
        try { (await fetch(SB_URL + '/rest/v1/profiles?select=id,name&id=in.(' + ids.join(',') + ')',
          { headers: sbH(CLOUD.session.access_token) }).then(r => r.json())).forEach(p => { names[p.id] = p.name; }); } catch {}
        d.innerHTML = head + ms.slice(0, 3).map(m => {
          const hs = decodeScore(m.host_score), nm = esc(names[m.host] || 'A friend'), total = (m.term_ids || []).length || 5;
          return `<div class="frow"><div class="fav">${hostLive(m) ? '🔴' : '🎯'}</div><div class="fnm">${hostLive(m)
            ? nm + ' — LIVE race, join now!'
            : nm + ' scored ' + (hs ? hs.score : 0) + '/' + total + ' — beat it!'}</div>
           <button class="btn sm" data-action="play-inbox" data-id="${m.id}">Play</button></div>`; }).join('') + (ms.length > 3 ? `<p class="note">…and ${ms.length - 3} more</p>` : '');
      }).catch(() => {});
  }
  function challengeFriend(id) {
    ensureFriends();
    const f = S.friends.find(x => x.id === id); if (!f) return;
    if ((f.id || '').length > 20 && sbUid()) {          // real friend → live race
      const picks = sample(allTerms(S.courseId), 7);   // wider pool + 7 Qs → fewer ties
      (async () => {
        const mid = await sbCreateMatch(picks.map(p => p.id), null, f.id);   // created BEFORE playing
        toast('🔴 Live! Tell ' + f.name + ' to open Arena → Friends NOW');
        quizRace({ name: f.name, av: f.av, fixedScore: 0 }, async (won, me) => {
          // qLivePatch already published host_score = 100+me on finish
          if (mid) pollResult(mid, me, { name: f.name, av: f.av, iAmGuest: false });
          else showMatchResult(true, me, 0, f);
        }, picks, mid ? { mid, mine: 'host_score', opp: 'guest_score' } : null);
      })();
      return;
    }
    if ((f.id || '').length <= 20) toast('🤖 Bot match — ' + f.name + ' has no 🟢 link. Re-exchange fresh codes to play for real.');
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
  const randTourBot = () => ({ name: sample(BOT_NAMES, 1)[0], av: sample(BOT_AV, 1)[0], skill: rand(35, 60) / 100 });
  // Configurable knockout: size 4/6/8/16, mode 'open' (bots) or 'friends' (real
  // friends only; bots added only if you explicitly choose to fill). You run a
  // gauntlet — win ceil(log2 size) rounds to take the cup.
  function startTourney(size, mode, extraBots) {
    ensureFriends();
    const isReal = f => !!(f.live || (f.id || '').length > 20);
    let pool;
    if (mode === 'friends') {
      pool = (S.friends || []).filter(isReal).map(f => ({ name: f.name, av: f.av, skill: 0.45 })).slice(0, size - 1);
      for (let i = 0; i < (extraBots || 0) && pool.length < size - 1; i++) pool.push(randTourBot());
    } else {
      pool = (S.friends || []).filter(f => !isReal(f)).map(f => ({ name: f.name, av: f.av, skill: f.skill || 0.45 })).slice(0, size - 1);
    }
    while (pool.length < size - 1) pool.push(randTourBot());   // always fill the bracket
    pool = shuffle(pool);
    S.tourney = { size, mode, round: 1, totalRounds: Math.ceil(Math.log2(size)), stage: 'playing', champ: null, pool, opp: { ...pool[0] } };
    persist(); arenaTab = 'friends'; renderArena();
  }
  function tourneyPlay() {
    const t = S.tourney, opp = t.opp;
    quizRace({ name: opp.name, av: opp.av, skill: Math.min(0.75, 0.38 + t.round * 0.06) }, won => {
      if (won) {
        if (t.round >= t.totalRounds) { t.stage = 'done'; t.champ = { name: 'You', av: '😀', me: true }; S.gems += 40; S.xp += 40; S.xpWeek += 40; }
        else { t.round++; t.opp = { ...(t.pool[t.round - 1] || randTourBot()) }; }
      } else { t.stage = 'done'; t.champ = { name: opp.name, av: opp.av }; }
      persist(); renderTop(); arenaTab = 'friends'; go('battle');
    });
  }

  /* ---------------- LEAGUE (weekly flavour) ---------------- */
  // Bots don't gain XP (they're practice only); real friends' XP syncs from the cloud.
  function bumpLeague() { ensureFriends(); }

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

      <div class="settings-card mt"><div class="seg-label">🎬 ${tl('Celebrations')} · ${CELE_GALLERY.filter(([v]) => (S.celeSeen || {})[v]).length}/${CELE_GALLERY.length} ${tl('collected')}</div>
        <p class="note" style="margin:4px 0 8px">Collect them by earning them in play — the four story scenes (🐣📚🌧️🌸) unlock on special moments. Tap any to watch it (✓ = collected).</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${CELE_GALLERY.map(([v, label]) => {
          const got = !!(S.celeSeen || {})[v];
          return `<button class="btn sm ghost cele-chip${got ? ' got' : ''}" data-action="play-cele" data-cele="${v}">${label}${got ? ' ✓' : ''}</button>`; }).join('')}</div></div>

      <div class="mt"><button class="btn ghost" data-action="feedback">💬 ${tl('Send feedback / report a bug')}</button></div>
      <div class="mt"><button class="btn flat" data-action="reset">${tl('Reset progress')}</button></div>
      <p class="center" style="color:var(--muted);font-size:13px;margin-top:20px">${BRAND} · ${TAGLINE} · ${tl('installable as an app')}</p>`));
  }
  // Feedback / bug report → Supabase `feedback` table; queues locally if it isn't set up yet.
  function openFeedback() {
    $('#modal').removeAttribute('hidden');
    $('#modal-body').innerHTML = `<h2>💬 Feedback / report a bug</h2>
      <p>Hit a bug or have an idea? Tell us — it goes straight to the developer.</p>
      <textarea id="fbText" class="tinput" style="height:120px;text-align:left;font-size:14px" placeholder="What happened, or what would you like to see?"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn sm" data-action="feedback-send">Send</button>
        <button class="btn sm flat" data-action="close-modal">Cancel</button></div>
      <p class="note" style="margin-top:8px">Sent with your app language & version so we can reproduce it. No personal info.</p>`;
    setTimeout(() => { const t = $('#fbText'); if (t) t.focus(); }, 50);
  }
  async function sendFeedback() {
    const t = $('#fbText'); const text = (t && t.value || '').trim();
    if (!text) { toast('Type something first 🙂'); return; }
    $('#modal').setAttribute('hidden', '');
    const item = { reporter: sbUid(), text: text.slice(0, 2000), course: S.courseId, ua: (navigator.userAgent || '').slice(0, 300) };
    try {
      const r = await fetch(SB_URL + '/rest/v1/feedback', { method: 'POST', headers: sbH(CLOUD.session && CLOUD.session.access_token), body: JSON.stringify(item) });
      if (r.ok) { toast('🙏 Thanks — feedback sent!'); return; }
    } catch {}
    S.fbQueue = S.fbQueue || []; S.fbQueue.push(item); persist();   // retry on a later boot
    toast('🙏 Thanks — saved; it’ll send once feedback is enabled.');
  }
  async function flushFeedback() {
    if (!sbUid() || !(S.fbQueue && S.fbQueue.length)) return;
    for (const item of S.fbQueue.slice()) {
      try {
        const r = await fetch(SB_URL + '/rest/v1/feedback', { method: 'POST', headers: sbH(CLOUD.session.access_token), body: JSON.stringify(item) });
        if (!r.ok) break;
        S.fbQueue = S.fbQueue.filter(x => x !== item); persist();
      } catch { break; }
    }
  }
  // Celebration gallery (Me tab) — replay any animation on demand.
  const CELE_GALLERY = [
    ['firstflight', '🐣 First Flight'], ['library', '📚 The Library'], ['rainy', '🌧️ Rainy Window'], ['duel', '🌸 The Duel'],
    ['party', '🎉 Party'], ['fireworks', '🎆 Fireworks'], ['trophy', '🏆 Trophy'], ['highfive', '🙌 High five'],
    ['confetti', '🎊 Confetti'], ['fly', '🦸 Superhero'], ['night', '🌙 Night watch'], ['mj', '🕺 Moonwalk'],
    ['genius', '🧐 Thinker'], ['samurai', '⚔️ Samurai'], ['frozen', '🥶 Frozen'],
  ];
  function showCele(v) {
    const c = course();
    $('#lesson').classList.remove('hidden');
    $('#lesson').innerHTML = `<div class="lesson"><div class="complete">
      ${celebrate(c.mascot, v === 'frozen' ? 10 : null, v)}
      <div class="mt"><button class="btn" data-action="cele-close">Close</button></div></div></div>`;
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
      case 'toggle-inbox': window.__inboxOpen = !window.__inboxOpen; loadInbox(); break;
      case 'play-inbox': { const m = INBOX.find(x => x.id === a.id); if (!m) break;
        if (COURSES[m.course]) { S.courseId = m.course; applyTheme(); renderTop(); }
        const terms = allTerms(m.course).filter(t => (m.term_ids || []).includes(t.id));
        if (terms.length < 2) { toast('Could not load that match'); break; }
        quizRace({ name: 'your friend', av: '🎯' }, async (won, me) => {
          await sbAnswerMatch(m.id, me);           // publishes guest_score = 100+me, ensures guest/FK
          pollResult(m.id, me, { name: 'your friend', av: '🎯', iAmGuest: true });   // resolves instantly if host already done
        }, terms, { mid: m.id, mine: 'guest_score', opp: 'host_score' }); break; }
      case 'create-challenge': createChallenge(); break;
      case 'join-challenge': joinChallenge(); break;
      case 'join-go': { const t = $('#joinCode'); const raw = (t && t.value || '').trim(); $('#modal').setAttribute('hidden', ''); if (raw) playJoinedCode(raw); break; }
      case 'edit-name': { const n = prompt('Your display name:', S.displayName || ''); if (n != null) { const cleaned = cleanName(n); if (!cleaned) { toast('Name can’t be empty'); break; } if (!nameOK(cleaned)) { toast('Please pick a friendlier name 🙂'); break; } S.displayName = cleaned; persist(); renderArena(); renderTop(); sbSync(); } break; }
      case 'copy-mycode': { const ta = $('#myCode'); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value); } catch {} document.execCommand && document.execCommand('copy'); toast('Friend code copied'); } break; }
      case 'add-by-code': { const raw = prompt('Paste your friend’s code:'); if (!raw) break; let d; try { d = dec(raw); } catch { toast('Invalid code'); break; } if (!d || d.ww !== 'friend') { toast('Invalid friend code'); break; } if (d.id === (sbUid() || S.myId)) { toast("That's your OWN code 😄 — send it to your friend, paste THEIRS here"); break; } if ((S.friends || []).some(f => f.id === d.id)) { toast('Already friends'); break; } ensureFriends();
        const isCloud = (d.id || '').length > 20;
        S.friends.push({ id: d.id || 'f' + Date.now(), name: (d.n || 'Friend').slice(0, 18), av: sample(BOT_AV, 1)[0], xp: 0, skill: 0.45, live: isCloud });
        if (isCloud && sbUid()) fetch(SB_URL + '/rest/v1/friends', { method: 'POST', headers: sbH(CLOUD.session.access_token), body: JSON.stringify({ a: sbUid(), b: d.id }) }).catch(() => {});
        persist(); renderArena(); toast('Added ' + (d.n || 'friend') + (isCloud ? ' 🟢 (live)' : '')); break; }
      case 'copy-code': { const ta = $('#chalCode'); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value); } catch {} document.execCommand && document.execCommand('copy'); toast('Code copied'); } break; }
      case 'tourney-size': window.__tSize = +a.n; renderArena(); break;
      case 'start-tourney': startTourney(+window.__tSize || 8, a.mode || 'open', +a.bots || 0); break;
      case 'tourney-play': tourneyPlay(); break;
      case 'reset-tourney': S.tourney = null; persist(); renderArena(); break;
      case 'quiz-answer': quizAnswer(+a.idx); break;
      case 'quiz-quit': qStopPoll(); $('#lesson').classList.add('hidden'); Q = null; go('battle'); break;
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
      case 'play-cele': showCele(a.cele); break;
      case 'cele-close': $('#lesson').classList.add('hidden'); go('me'); break;
      case 'toggle-lb': window.__lbOpen = !window.__lbOpen; renderArena(); break;
      case 'feedback': openFeedback(); break;
      case 'feedback-send': sendFeedback(); break;
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

  /* ---------------- Moderation + weekly reset ---------------- */
  // Monday-anchored week id, e.g. "2026-07-06", so xp_week resets each new week.
  function weekKey(d = new Date()) {
    const t = new Date(d); t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7));   // back to this week's Monday
    return t.toISOString().slice(0, 10);
  }
  // Display-name guard: cap length, and reject slurs/profanity (deterrent, not airtight).
  // Severe words matched anywhere (catches "shithead", "fuckface"); false-positives rare.
  const BAD_SUBSTR = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'nigga', 'faggot', 'pussy', 'whore', 'slut', 'asshole', 'dickhead', 'motherf', 'wank', 'twat', 'bastard', 'retard', 'jerkoff', 'dildo'];
  // Common English substrings (class/peacock/shoe) → block only as standalone words.
  const BAD_TOKEN = ['ass', 'fag', 'hoe', 'cock', 'dick'];
  function cleanName(raw) { return (raw || '').replace(/\s+/g, ' ').trim().slice(0, 18); }
  function nameOK(n) {
    const low = n.toLowerCase();
    const squashed = low.replace(/[^a-z]/g, '');
    if (BAD_SUBSTR.some(w => squashed.includes(w))) return false;
    const tokens = ' ' + low.replace(/[^a-z0-9]+/g, ' ') + ' ';
    if (BAD_TOKEN.some(w => tokens.includes(' ' + w + ' '))) return false;
    return true;
  }

  /* ---------------- Boot ---------------- */
  if (S.weekKey !== weekKey()) { if (S.weekKey) { S.xpWeek = 0; } S.weekKey = weekKey(); }   // new week → weekly XP resets
  if (S.lastDay !== today()) S.lanterns = S.lanternsMax;
  // streak break check: missing a full day resets the streak unless a 🧊 freeze absorbs it
  if (S.lastDay && S.lastDay !== today()) {
    const gap = Math.round((Date.parse(today()) - Date.parse(S.lastDay)) / 864e5);
    if (gap > 1) { if ((S.freeze || 0) > 0) { S.freeze--; setTimeout(showStreakSaved, 700); } else S.streak = 0; }
  }
  if (!S.myId) S.myId = 'u' + Math.random().toString(36).slice(2, 9);
  applyTheme(); applyUiLang(); renderTop(); go('learn'); persist();
  sbAuth().then(ok => { if (ok) { sbSync(); flushFeedback(); } });
  window.WW = { go, S };
})();
