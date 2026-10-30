/* Catalogue des compétences : sert aux barres de « Mi progreso ».
   Un module cite ces identifiants dans `skills`. Une compétence sans module reste « Por descubrir » (feuille de route). */
window.ESP = window.ESP || {};
window.ESP.SKILLS = [
  { id: 'presentarme', es: 'Presentarme', fr: 'Me présenter', group: 'situaciones' },
  { id: 'pedir-cafeteria', es: 'Pedir algo en una cafetería', fr: 'Commander dans un café', group: 'situaciones' },
  { id: 'pedir-foto', es: 'Pedir una foto a un desconocido', fr: 'Demander une photo à un inconnu', group: 'situaciones' },
  { id: 'comprender-indicaciones', es: 'Comprender indicaciones', fr: 'Comprendre des indications', group: 'situaciones' },
  { id: 'comprar-mercado', es: 'Comprar en el mercado', fr: 'Faire ses achats au marché', group: 'situaciones' },
  { id: 'reservar-habitacion', es: 'Reservar una habitación', fr: 'Réserver une chambre', group: 'situaciones' },
  { id: 'hablar-gustos', es: 'Hablar de mis gustos', fr: 'Parler de mes goûts', group: 'situaciones' },
  { id: 'describir-rutina', es: 'Describir mi rutina', fr: 'Décrire ma routine', group: 'situaciones' },
  { id: 'estar-gerundio', es: 'Decir lo que está pasando ahora', fr: 'Dire ce qui se passe en ce moment', group: 'gramatica' },
  { id: 'preterito-perfecto', es: 'Utilizar el pretérito perfecto', fr: 'Utiliser le pretérito perfecto', group: 'gramatica' },
  { id: 'verbos-reflexivos', es: 'Usar los verbos reflexivos', fr: 'Utiliser les verbes pronominaux', group: 'gramatica' },
  { id: 'describir-caracter', es: 'Describir el carácter de una persona', fr: 'Décrire le caractère d’une personne', group: 'gramatica' },
  { id: 'reconocer-alimentos', es: 'Reconocer los alimentos', fr: 'Reconnaître les aliments', group: 'palabras' },
  { id: 'comprender-texto-cultural', es: 'Comprender un texto cultural', fr: 'Comprendre un texte culturel', group: 'lecturas' }
];
