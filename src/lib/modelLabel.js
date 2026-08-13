export function modelLabel(m) {
  const badge = m.badge === 'free' ? '🟢' : '🟡';
  const suffix = m.source === 'openrouter' ? 'OpenRouter' : m.provider;
  return `${badge} ${m.name} · ${suffix}`;
}

export function modelCounts(models) {
  return {
    total: models.length,
    free: models.filter((m) => m.badge === 'free').length,
    quota: models.filter((m) => m.badge !== 'free').length,
  };
}