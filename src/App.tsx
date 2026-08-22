import { useState, useEffect } from 'react';
import type { Card, Deck, UserStats, Achievement, ActiveTab } from './types/flashcard';
import type { User } from './types/auth';
import { AuthService } from './services/authService';
import { StorageService } from './services/storageService';
import { ApiService } from './services/apiService';
import { ThemeService } from './services/themeService';
import { soundEffects } from './services/soundEffects';
import { Header } from './components/Header';
import { DeckList } from './components/DeckList';
import { DeckDetail } from './components/DeckDetail';
import { StudyMode } from './components/StudyMode';
import { QuizGame } from './components/QuizGame';
import { SpellingGame } from './components/SpellingGame';
import { MemoryMatchGame } from './components/MemoryMatchGame';
import { VoicePronounceGame } from './components/VoicePronounceGame';
import { RoleplayView } from './components/RoleplayView';
import { StatsView } from './components/StatsView';
import { UserManagementView } from './components/UserManagementView';
import { AddEditCardModal } from './components/AddEditCardModal';
import { AddEditDeckModal } from './components/AddEditDeckModal';
import { ImportExportModal } from './components/ImportExportModal';
import { AuthModal } from './components/AuthModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(AuthService.getCurrentUser());
  
  // Instant Initial State (Zero-wait render from local storage cache)
  const [decks, setDecks] = useState<Deck[]>(() => StorageService.getDecks(currentUser?.id));
  const [cards, setCards] = useState<Card[]>(() => StorageService.getCards(currentUser?.id));
  const [stats, setStats] = useState<UserStats>(() => StorageService.getStats(currentUser?.id));
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageService.getAchievements(currentUser?.id));
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('decks');
  const [selectedDeck, setSelectedDeck] = useState<Deck | undefined>(undefined);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardModalDeckId, setCardModalDeckId] = useState<string>('');

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [importExportDeckId, setImportExportDeckId] = useState<string | undefined>(undefined);

  // Background Cloud Sync (Stale-While-Revalidate pattern)
  const refreshData = async (user?: User | null) => {
    const activeUser = user !== undefined ? user : currentUser;
    
    try {
      const isHealthy = await ApiService.checkHealth();

      if (isHealthy) {
        const [apiDecks, apiCards, apiStats] = await Promise.all([
          ApiService.getDecks(activeUser?.id),
          ApiService.getCards(activeUser?.id),
          ApiService.getStats(activeUser?.id),
        ]);
        
        if (apiDecks && apiDecks.length > 0) setDecks(apiDecks);
        if (apiCards && apiCards.length > 0) setCards(apiCards);
        if (apiStats) setStats(apiStats);
        setAchievements(StorageService.getAchievements(activeUser?.id));
      } else {
        setDecks(StorageService.getDecks(activeUser?.id));
        setCards(StorageService.getCards(activeUser?.id));
        setStats(StorageService.getStats(activeUser?.id));
        setAchievements(StorageService.getAchievements(activeUser?.id));
      }
    } catch {
      // Graceful fallback to cached storage
      setDecks(StorageService.getDecks(activeUser?.id));
      setCards(StorageService.getCards(activeUser?.id));
    }
  };

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    refreshData(user);

    // Theme initialization
    ThemeService.init();
    const savedTheme = localStorage.getItem('vm_theme') || 'light';
    const darkBool = savedTheme === 'dark';
    setIsDark(darkBool);
    if (darkBool) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle User change (Login, Switch User, Logout)
  const handleUserChanged = (newUser: User | null) => {
    setCurrentUser(newUser);
    refreshData(newUser);
    setSelectedDeck(undefined);
    if (activeTab === 'users' && (!newUser || newUser.role !== 'admin')) {
      setActiveTab('decks');
    }
  };

  const handleToggleTheme = () => {
    soundEffects.playPop();
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vm_theme', 'light');
    }
  };

  const handleToggleSound = () => {
    const next = !stats.soundEnabled;
    soundEffects.setEnabled(next);
    const updated = { ...stats, soundEnabled: next };
    setStats(updated);
    StorageService.saveStats(updated, currentUser?.id);
    if (next) soundEffects.playCorrect();
  };

  // Add XP callback from Study / Games
  const handleEarnXP = async (xp: number, isPerfectQuiz = false) => {
    if (isPerfectQuiz) {
      stats.perfectQuizzes = (stats.perfectQuizzes || 0) + 1;
    }
    const result = await ApiService.addXP(xp, currentUser?.id, isPerfectQuiz);
    setStats({ ...result.newStats });
    setAchievements(StorageService.getAchievements(currentUser?.id));

    if (result.leveledUp) {
      soundEffects.playVictory();
      alert(`🎉 CHÚC MỪNG ${currentUser?.fullName || 'Bạn'}! Đã thăng cấp lên Level ${result.newStats.level}!`);
    }
  };

  // Deck Actions
  const handleSelectDeck = (deck: Deck) => {
    soundEffects.playPop();
    setSelectedDeck(deck);
    setActiveTab('deck-detail');
  };

  const handleStartStudy = (deck?: Deck) => {
    soundEffects.playPop();
    setSelectedDeck(deck);
    setActiveTab('study');
  };

  const handleSaveDeck = async (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (deckData.id) {
      // Edit
      const updatedDecks = decks.map(d => d.id === deckData.id ? { ...d, ...deckData, updatedAt: new Date().toISOString() } : d);
      setDecks(updatedDecks);
      StorageService.saveDecks(updatedDecks, currentUser?.id);
    } else {
      // New
      const newDeckData: Partial<Deck> = {
        ...deckData,
        userId: currentUser?.id,
        authorName: currentUser?.fullName || 'Khách',
        isPublic: currentUser?.role === 'admin',
      };
      
      const created = await ApiService.createDeck(newDeckData, currentUser?.id);
      if (created) {
        setDecks([created, ...decks]);
      } else {
        const localDeck: Deck = {
          ...newDeckData,
          id: `deck-${Date.now()}`,
          title: deckData.title,
          description: deckData.description,
          category: deckData.category,
          icon: deckData.icon || 'BookOpen',
          color: deckData.color || 'from-blue-500 to-indigo-600',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [localDeck, ...decks];
        setDecks(updated);
        StorageService.saveDecks(updated, currentUser?.id);
      }
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    soundEffects.playPop();
    await ApiService.deleteDeck(deckId);
    const updatedDecks = decks.filter(d => d.id !== deckId);
    const updatedCards = cards.filter(c => c.deckId !== deckId);
    setDecks(updatedDecks);
    setCards(updatedCards);
    StorageService.saveDecks(updatedDecks, currentUser?.id);
    StorageService.saveCards(updatedCards, currentUser?.id);
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(undefined);
      setActiveTab('decks');
    }
  };

  // Card Actions
  const handleSaveCard = async (cardData: Omit<Card, 'id' | 'srsLevel' | 'intervalDays' | 'easeFactor' | 'repetitionCount' | 'dueDate' | 'mastery' | 'createdAt'> & { id?: string }) => {
    const today = new Date().toISOString().split('T')[0];

    if (cardData.id) {
      // Edit
      await ApiService.updateCard(cardData.id, cardData);
      const updatedCards = cards.map(c => c.id === cardData.id ? { ...c, ...cardData } : c);
      setCards(updatedCards);
      StorageService.saveCards(updatedCards, currentUser?.id);
    } else {
      // New
      const created = await ApiService.createCard({ ...cardData, userId: currentUser?.id }, currentUser?.id);
      if (created) {
        setCards([created, ...cards]);
      } else {
        const newCard: Card = {
          ...cardData,
          id: `card-${Date.now()}`,
          userId: currentUser?.id,
          srsLevel: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          repetitionCount: 0,
          dueDate: today,
          mastery: 'new',
          createdAt: new Date().toISOString(),
        };
        const updatedCards = [newCard, ...cards];
        setCards(updatedCards);
        StorageService.saveCards(updatedCards, currentUser?.id);
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    await ApiService.deleteCard(cardId);
    const updated = cards.filter(c => c.id !== cardId);
    setCards(updated);
    StorageService.saveCards(updated, currentUser?.id);
  };

  const handleResetData = () => {
    StorageService.resetToDefault(currentUser?.id);
    refreshData(currentUser);
    setSelectedDeck(undefined);
    setActiveTab('decks');
    alert('Đã khôi phục dữ liệu mặc định thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white transition-colors duration-200">
      
      {/* Global Navigation Header */}
      <Header
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleTheme={handleToggleTheme}
        isDark={isDark}
      />

      {/* Main App Content Body */}
      <main className="flex-1 pb-24 md:pb-12">
        {/* TAB 1: DECKS OVERVIEW */}
        {activeTab === 'decks' && (
          <DeckList
            decks={decks}
            cards={cards}
            stats={stats}
            onSelectDeck={handleSelectDeck}
            onStudyDeck={handleStartStudy}
            onCreateDeck={() => {
              if (!currentUser) {
                soundEffects.playPop();
                setIsAuthModalOpen(true);
                return;
              }
              setEditingDeck(null);
              setIsDeckModalOpen(true);
            }}
            onEditDeck={(deck) => {
              setEditingDeck(deck);
              setIsDeckModalOpen(true);
            }}
            onDeleteDeck={handleDeleteDeck}
          />
        )}

        {/* TAB 2: DECK DETAIL & WORDS */}
        {activeTab === 'deck-detail' && selectedDeck && (
          <DeckDetail
            deck={selectedDeck}
            cards={cards}
            onBack={() => setActiveTab('decks')}
            onStartStudy={(d) => handleStartStudy(d)}
            onStartQuiz={() => setActiveTab('quiz')}
            onStartSpelling={() => setActiveTab('spelling')}
            onStartMatch={() => setActiveTab('match')}
            onStartVoice={() => setActiveTab('voice')}
            onAddCard={(deckId) => {
              setEditingCard(null);
              setCardModalDeckId(deckId);
              setIsCardModalOpen(true);
            }}
            onEditCard={(c) => {
              setEditingCard(c);
              setCardModalDeckId(c.deckId);
              setIsCardModalOpen(true);
            }}
            onDeleteCard={handleDeleteCard}
            onOpenImportExport={(deckId) => {
              setImportExportDeckId(deckId);
              setIsImportExportOpen(true);
            }}
          />
        )}

        {/* TAB 3: FLASHCARD STUDY MODE */}
        {activeTab === 'study' && (
          <StudyMode
            deck={selectedDeck}
            allCards={cards}
            onUpdateCards={(newCards) => setCards(newCards)}
            onExit={() => setActiveTab(selectedDeck ? 'deck-detail' : 'decks')}
            onStudyFinished={(xp) => handleEarnXP(xp)}
            voiceAccent={stats.voiceAccent}
            voiceSpeed={stats.voiceSpeed}
          />
        )}

        {/* TAB 4: QUIZ MINI-GAME */}
        {activeTab === 'quiz' && (
          <div>
            <div className="max-w-2xl mx-auto px-4 pt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm"
              >
                Trắc nghiệm 4 đáp án
              </button>
              <button
                onClick={() => setActiveTab('spelling')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Luyện gõ từ
              </button>
              <button
                onClick={() => setActiveTab('match')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Lật thẻ ghép đôi
              </button>
            </div>
            <QuizGame
              cards={cards}
              decks={decks}
              selectedDeck={selectedDeck}
              onExit={() => setActiveTab('decks')}
              onQuizFinished={(xp, isPerfect) => handleEarnXP(xp, isPerfect)}
            />
          </div>
        )}

        {/* TAB 5: SPELLING GAME */}
        {activeTab === 'spelling' && (
          <div>
            <div className="max-w-2xl mx-auto px-4 pt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Trắc nghiệm 4 đáp án
              </button>
              <button
                onClick={() => setActiveTab('spelling')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm"
              >
                Luyện gõ từ
              </button>
              <button
                onClick={() => setActiveTab('match')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Lật thẻ ghép đôi
              </button>
            </div>
            <SpellingGame
              cards={cards}
              decks={decks}
              selectedDeck={selectedDeck}
              onExit={() => setActiveTab('decks')}
              onFinished={(xp) => handleEarnXP(xp)}
            />
          </div>
        )}

        {/* TAB 6: MATCHING GAME */}
        {activeTab === 'match' && (
          <div>
            <div className="max-w-2xl mx-auto px-4 pt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Trắc nghiệm 4 đáp án
              </button>
              <button
                onClick={() => setActiveTab('spelling')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Luyện gõ từ
              </button>
              <button
                onClick={() => setActiveTab('match')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm"
              >
                Lật thẻ ghép đôi
              </button>
            </div>
            <MemoryMatchGame
              cards={cards}
              decks={decks}
              selectedDeck={selectedDeck}
              onExit={() => setActiveTab('decks')}
              onFinished={(xp) => handleEarnXP(xp)}
            />
          </div>
        )}

        {/* TAB 7: VOICE PRONUNCIATION STUDIO */}
        {activeTab === 'voice' && (
          <VoicePronounceGame
            cards={cards}
            decks={decks}
            selectedDeck={selectedDeck}
            onExit={() => setActiveTab('decks')}
            onFinished={(xp) => handleEarnXP(xp)}
            voiceAccent={stats.voiceAccent}
          />
        )}

        {/* TAB 8: INTERACTIVE ROLEPLAY CONVERSATION STUDIO */}
        {activeTab === 'roleplay' && (
          <RoleplayView
            onBack={() => setActiveTab('decks')}
            onEarnXP={(xp) => handleEarnXP(xp)}
            voiceAccent={stats.voiceAccent}
            voiceSpeed={stats.voiceSpeed}
          />
        )}

        {/* TAB 9: STATS & ACHIEVEMENTS */}
        {activeTab === 'stats' && (
          <StatsView
            stats={stats}
            cards={cards}
            achievements={achievements}
            onUpdateStats={(newStats) => setStats(newStats)}
            onResetData={handleResetData}
          />
        )}

        {/* TAB 9: ADMIN USER MANAGEMENT */}
        {activeTab === 'users' && currentUser && currentUser.role === 'admin' && (
          <UserManagementView
            currentUser={currentUser}
            onBack={() => setActiveTab('decks')}
            onUserListChanged={() => refreshData(currentUser)}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleUserChanged}
      />

      <AddEditCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        initialCard={editingCard}
        deckId={cardModalDeckId || decks[0]?.id || 'deck-oxford-3000'}
      />

      <AddEditDeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onSave={handleSaveDeck}
        initialDeck={editingDeck}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        targetDeckId={importExportDeckId}
        decks={decks}
        cards={cards}
        onDataChanged={() => refreshData(currentUser)}
      />

    </div>
  );
}

export default App;
