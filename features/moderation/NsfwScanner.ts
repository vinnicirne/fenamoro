import * as nsfwjs from 'nsfwjs';

// Singleton instance to avoid reloading the model
let modelInstance: nsfwjs.NSFWJS | null = null;

export const loadNsfwModel = async () => {
  if (!modelInstance) {
    try {
      // Carrega o modelo padrao hospedado em CDN (MobileNetV2)
      modelInstance = await nsfwjs.load();
    } catch (error) {
      console.error("Erro ao carregar o modelo de IA:", error);
      throw new Error("Não foi possível carregar o sistema de segurança.");
    }
  }
  return modelInstance;
};

export const scanImageForNsfw = async (imageElement: HTMLImageElement): Promise<boolean> => {
  const model = await loadNsfwModel();
  
  // Realiza a classificacao
  const predictions = await model.classify(imageElement);
  console.log("NSFW Predictions:", predictions);

  // Consideramos seguro se "Porn", "Hentai" ou "Sexy" NAO passarem de certos limites
  // Sexy pode ter falso positivo em praias, mas como é um app gospel, o limite é rigoroso.
  for (const p of predictions) {
    if (p.className === 'Porn' && p.probability > 0.4) return false;
    if (p.className === 'Hentai' && p.probability > 0.4) return false;
    if (p.className === 'Sexy' && p.probability > 0.6) return false;
  }

  // Passou na validacao
  return true;
};
