// State tema cuma 1 field: 'dark' atau 'light'.
// Nilai awal dibaca dari class 'dark' yang udah ke-set di <html> (liat index.ejs).
const themeStore = createStore({
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
});

function renderTheme(state) {
  const icon = document.getElementById('theme-icon');

  if (state.theme === 'dark') {
    document.documentElement.classList.add('dark');
    icon.textContent = '☀️'; // pas mode gelap, tombolnya nawarin pindah ke terang
  } else {
    document.documentElement.classList.remove('dark');
    icon.textContent = '🌙';
  }

  // simpen preferensi biar keinget pas reload/kunjungan berikutnya
  localStorage.setItem('theme', state.theme);
}

themeStore.subscribe(renderTheme);
renderTheme(themeStore.getState()); // sync icon pas pertama load

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = themeStore.getState().theme;
  themeStore.setState({ theme: current === 'dark' ? 'light' : 'dark' });
});
