/* 每日一言：按本地日期取模选取，同一天内刷新不变，次日顺延。
   数据为精选 60 条，每条含 [中文, English, Français]。 */
(function () {
  var QUOTES = [
    ["爱是没有卑微可言的。", "There is nothing base about love.", "Il n'y a rien de bas dans l'amour."],
    ["错误的方法，远比错误的结论致命得多。", "A wrong method is far more lethal than a wrong conclusion.", "Une méthode erronée est bien plus meurtrière qu'une conclusion erronée."],
    ["最能带来开心的，恰恰是把自己明知必要但不喜欢做的事做成了。", "The greatest joy comes precisely from finishing what you knew was necessary but did not enjoy.", "La plus grande joie vient précisément d'avoir achevé ce que l'on savait nécessaire mais que l'on n'aimait pas faire."],
    ["淡定和坦然本身就可以解决大部分问题。", "Calm and composure alone can solve most problems.", "Le calme et la sérénité suffisent à eux seuls à résoudre la plupart des problèmes."],
    ["世事无常，你可以有常。", "The world is ever-changing; you can be constant.", "Le monde est inconstant ; toi, tu peux être constant."],
    ["独立意味着生活独立，情感独立和精神独立。", "Independence means independence in life, in emotion, and in spirit.", "L'indépendance, c'est l'indépendance dans la vie, dans les émotions et dans l'esprit."],
    ["人的共识并非真理的标准。", "Consensus is not the measure of truth.", "Le consensus n'est pas la mesure de la vérité."],
    ["人会活成自己相信的样子，所以要自我激励，但不要自我欺骗。", "We become what we believe ourselves to be — so motivate yourself, but never deceive yourself.", "On devient ce que l'on croit être — alors motive-toi, mais ne te mens jamais."],
    ["世上唯一的狂妄是否定事实。", "The only arrogance in the world is denying the facts.", "La seule arrogance au monde est de nier les faits."],
    ["不必坐而论道，何如起而行之。", "Rather than sit and theorize, why not rise and act?", "Plutôt que de deviser assis, pourquoi ne pas se lever et agir ?"],
    ["爱胜于情，爱是永不止息。", "Love surpasses feeling; love never fails.", "L'amour surpasse le sentiment ; l'amour ne passe jamais."],
    ["情绪稳定的本质在于掌控欲和掌控力的比值。", "Emotional stability is, at bottom, the ratio of the desire to control to the power to control.", "La stabilité émotionnelle tient au rapport entre le désir de contrôle et le pouvoir de contrôler."],
    ["不能让你痛苦的东西，没有资格让你快乐。", "What cannot make you suffer has no right to make you happy.", "Ce qui ne peut pas te faire souffrir n'a pas le droit de te rendre heureux."],
    ["人生惟尽义、尽力而已，其它要看天命，不必执着。", "In life one only does one's duty and one's utmost; the rest is up to fate — do not cling to it.", "Dans la vie, on n'a qu'à faire son devoir et de son mieux ; le reste dépend du destin — sans s'y attacher."],
    ["人需要拥有的最重要的核心能力，就是无歧义、完备、简洁的表达能力。", "The most important core ability one can have is to express oneself unambiguously, completely, and concisely.", "La capacité essentielle la plus importante est de s'exprimer sans ambiguïté, pleinement et avec concision."],
    ["人是从谦卑开始变强的。", "One grows strong starting from humility.", "C'est à partir de l'humilité que l'on devient fort."],
    ["尊重是一种政策，是你这个一人之国的法律。", "Respect is a policy — the law of your one-person nation.", "Le respect est une politique — la loi de ta nation d'une seule personne."],
    ["会等的人可以看到很多奇迹。", "Those who can wait will see many miracles.", "Qui sait attendre verra bien des miracles."],
    ["礼貌是自己对自己的尊重。", "Politeness is the respect you owe yourself.", "La politesse est le respect que l'on se doit à soi-même."],
    ["凡事要讲道理，少讲情绪。", "In all things, appeal to reason; speak of emotion sparingly.", "En toute chose, raisonne ; parle peu d'émotion."],
    ["做你当做的事，尽你当尽的义。", "Do what you ought to do; fulfill the duty that is yours.", "Fais ce que tu dois faire ; accomplis le devoir qui t'incombe."],
    ["说话做事要确切、踏实、具体，不要用诗性的语言讨论实践操作的事。", "Speak and act precisely, solidly, concretely; never discuss practical matters in poetic language.", "Parle et agis avec précision, solidité et concrétude ; ne discute jamais de choses pratiques en langage poétique."],
    ["独立思考背后的根基其实是独立生存，独立负责。", "The true foundation of independent thinking is independent survival and independent responsibility.", "Le véritable fondement de la pensée indépendante est la survie indépendante et la responsabilité indépendante."],
    ["真正永远不错的，是万变。", "The one thing never wrong is change itself.", "Ce qui ne se trompe jamais, c'est le changement même."],
    ["够强的人能认输。", "Only the strong can concede defeat.", "Seul le fort peut admettre sa défaite."],
    ["能力感的关键在于扎实，其次才是基于扎实的广博。", "The key to a sense of competence is solidity; breadth built on that solidity comes second.", "La clé du sentiment de compétence, c'est la solidité ; l'étendue bâtie sur elle vient ensuite."],
    ["把人生中维持性的事务构建成习惯，把进取性的价值追求构建成瘾。", "Turn everything sustaining in life into habit; turn every aspirational pursuit of value into addiction.", "Fais de tout ce qui entretient la vie une habitude ; fais de toute quête de valeur une addiction."],
    ["踏实就是冗余、备份和信仰。", "Being dependable is redundancy, backup, and faith.", "La fiabilité, c'est la redondance, la sauvegarde et la foi."],
    ["勇气的根基是高度的理性。", "The foundation of courage is a high degree of rationality.", "Le fondement du courage est un haut degré de rationalité."],
    ["行善不丧志。", "Do good, and do not lose heart.", "Fais le bien sans te décourager."],
    ["祈祷是你爱一个人时唯一可行的请求方式。", "Prayer is the only viable way to make a request of someone you love.", "La prière est la seule manière viable de demander quelque chose à celui que l'on aime."],
    ["你的内心戏不算数。", "Your inner drama does not count.", "Ton théâtre intérieur ne compte pas."],
    ["人生不是赛跑，而是旅游。", "Life is not a race; it is a journey.", "La vie n'est pas une course, c'est un voyage."],
    ["在历史面前，快乐是你待完成的义务，不是你可索取的权利。", "Before history, joy is a duty to fulfill, not a right to claim.", "Face à l'histoire, la joie est un devoir à accomplir, non un droit à revendiquer."],
    ["服从和接受客观世界的既定事实，不是软弱，而是谦卑。", "To accept and submit to the given facts of the objective world is not weakness but humility.", "Accepter et se soumettre aux faits établis du monde objectif n'est pas faiblesse, mais humilité."],
    ["不管是什么日子，都要有知觉、有自省、有目的地度过。", "Whatever the day may be, live it with awareness, self-reflection, and purpose.", "Quel que soit le jour, vis-le avec lucidité, introspection et dessein."],
    ["只存在乐观的技巧问题，不存在不可乐观的问题。", "There are only questions of the technique of optimism; there is no problem beyond hope.", "Il n'existe que des questions de technique de l'optimisme ; aucun problème n'est sans espoir."],
    ["真正绝对必须的其实是反脆弱。", "What is truly indispensable is, in fact, antifragility.", "Ce qui est vraiment indispensable, c'est en fait l'antifragilité."],
    ["人自身有避免无知的义务。", "Every person has a duty to avoid ignorance.", "Chacun a le devoir d'éviter l'ignorance."],
    ["一切遭遇都有意义。", "Every experience has meaning.", "Toute épreuve a un sens."],
    ["永远都不要为那些不可控的事耗费心力，永远都要为可控的事尽心尽力。", "Never spend your energy on what you cannot control; always give your all to what you can.", "Ne gaspille jamais ton énergie pour ce qui échappe à ton contrôle ; donne toujours ton maximum à ce que tu peux maîtriser."],
    ["接纳自己，指的是以你的主体性接纳你的客体性。", "To accept yourself is to accept your objectivity through your subjectivity.", "S'accepter, c'est accueillir son objectivité par sa subjectivité."],
    ["不要怯于用真正完善的伦理法则自我审视。", "Do not be afraid to examine yourself by truly complete ethical principles.", "Ne crains pas de t'examiner selon des principes éthiques vraiment aboutis."],
    ["所有可以被消除的痛苦都应该被消除。", "All suffering that can be eliminated should be eliminated.", "Toute souffrance qui peut être éliminée doit l'être."],
    ["没有原谅，就没有救赎。", "Without forgiveness, there is no redemption.", "Sans pardon, il n'y a pas de rédemption."],
    ["不包含任何行动的愿望是无意义的，说出来只构成对自己的欺骗。", "A wish that contains no action is meaningless; spoken aloud, it is only self-deception.", "Un souhait sans action est vide de sens ; dit à voix haute, il n'est qu'une duperie envers soi-même."],
    ["努力是一种天定的义务。", "Effort is a heaven-ordained duty.", "L'effort est un devoir prescrit par le ciel."],
    ["模糊意味着可能，这不仅仅包含坏的可能，同样包含好的可能。", "Ambiguity means possibility — not only the possibility of bad, but equally that of good.", "L'ambiguïté, c'est le possible — non seulement le mauvais possible, mais tout autant le bon."],
    ["在不理解的时候学习谦卑，在不被理解的时候学习原谅。", "Learn humility when you do not understand, and forgiveness when you are not understood.", "Apprends l'humilité quand tu ne comprends pas, et le pardon quand on ne te comprend pas."],
    ["人没有资格凭着自己的智慧就绝望。", "No one has the right to despair on the strength of their own wisdom.", "Nul n'a le droit de désespérer au nom de sa propre sagesse."],
    ["不怕肯定别人，不惜否定自己。", "Do not fear affirming others; do not spare yourself from self-denial.", "Ne crains pas d'affirmer les autres ; ne t'épargne pas de te renier toi-même."],
    ["一个人决不能给事实定冒犯的罪。", "One must never convict a fact of the crime of giving offense.", "On ne doit jamais condamner un fait pour le crime d'avoir offensé."],
    ["爱，不思恶。", "Love thinks no evil.", "L'amour ne pense pas le mal."],
    ["不要焦虑，不要沮丧，在这游戏中坚持下去。", "Do not be anxious, do not be discouraged; hold on in this game.", "Ne sois ni anxieux ni abattu ; tiens bon dans ce jeu."],
    ["既然命中注定有洪水，那就索性把游泳和冲浪学好。", "If a flood is destined, then simply learn to swim and to surf well.", "Puisqu'un déluge est inévitable, autant apprendre à bien nager et à surfer."],
    ["当失败不可能真正伤害到你时，失败就失去了一切真实的威力。", "When failure can no longer truly harm you, it loses all its real power.", "Quand l'échec ne peut plus vraiment te nuire, il perd toute sa puissance réelle."],
    ["问题不在于这个选择，而在于能不能承受住自己的选择。", "The question is not the choice, but whether you can bear your own choice.", "La question n'est pas le choix, mais de savoir si tu peux assumer ton choix."],
    ["如果你要恨，你总能找到足够的理由；如果你要爱，你总能找到足够的勇气。", "If you would hate, you will always find reason enough; if you would love, you will always find courage enough.", "Si tu veux haïr, tu trouveras toujours assez de raisons ; si tu veux aimer, tu trouveras toujours assez de courage."],
    ["人生最好的样式就是向死而生。", "The best way to live is to live toward death.", "La meilleure façon de vivre est de vivre vers la mort."],
    ["改变现实是从接受现实开始的。", "Changing reality begins with accepting reality.", "Changer la réalité commence par accepter la réalité."]
  ];

  /* 把本地年月日折算成连续的“天序号”，保证逐日 +1（跨月不跳变） */
  function dayNumber(d) {
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }

  function pick() {
    var i = dayNumber(new Date()) % QUOTES.length;
    if (i < 0) { i += QUOTES.length; }
    return QUOTES[i];
  }

  function pad(v) { return (v < 10 ? '0' : '') + v; }

  function render() {
    var textEl = document.getElementById('quote-text');
    if (!textEl) { return; }
    var q = pick();
    textEl.textContent = q[0];
    document.getElementById('quote-en').textContent = q[1];
    document.getElementById('quote-fr').textContent = q[2];
    var d = new Date();
    var iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    var dateEl = document.getElementById('quote-date');
    if (dateEl) { dateEl.textContent = iso; dateEl.setAttribute('datetime', iso); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();