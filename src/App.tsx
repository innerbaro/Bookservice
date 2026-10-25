import React, { useState, useEffect } from 'react';
import {
  fetchSession,
  switchUserSession,
  fetchCohortBooks,
  fetchNotifications,
  resetDemoData,
  fetchMyBookletDraft,
  SessionInfo,
} from './services/apiClient';
import {
  PublishedBooklet,
  UserAccount,
  NotificationOutboxItem,
  FontPreset,
  BookletDraft,
  SubmittedBooklet,
} from './types';
import { Header } from './components/Header';
import { DemoBanner } from './components/DemoBanner';
import { BookshelfView } from './components/BookshelfView';
import { BookletReader } from './components/BookletReader';
import { BookletAuthoringView } from './components/BookletAuthoringView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { CohortBriefingModal } from './components/CohortBriefingModal';
import { FontSettingsModal } from './components/FontSettingsModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminView } from './components/AdminView';

export default function App() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [currentTab, setCurrentTab] = useState<'bookshelf' | 'my-booklet' | 'admin'>('bookshelf');
  const [books, setBooks] = useState<PublishedBooklet[]>([]);
  const [notifications, setNotifications] = useState<NotificationOutboxItem[]>([]);
  const [myDraft, setMyDraft] = useState<BookletDraft | null>(null);
  const [mySubmitted, setMySubmitted] = useState<SubmittedBooklet | null>(null);
  const [readingFontPreset, setReadingFontPreset] = useState<FontPreset>('maruburi');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [selectedBookForReading, setSelectedBookForReading] = useState<PublishedBooklet | null>(null);
  const [isCohortInfoOpen, setIsCohortInfoOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const sess = await fetchSession();
      setSession(sess);
      if (sess.user.readingFontPreset) {
        setReadingFontPreset(sess.user.readingFontPreset);
      }

      const [loadedBooks, loadedNotifs, draftData] = await Promise.all([
        fetchCohortBooks(sess.eventConfig?.id || 'event-2026-10-seoul-forest'),
        fetchNotifications(),
        fetchMyBookletDraft(),
      ]);

      setBooks(loadedBooks);
      setNotifications(loadedNotifs);
      setMyDraft(draftData.draft);
      setMySubmitted(draftData.submitted);
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!session) return;
    try {
      const [loadedBooks, loadedNotifs, draftData] = await Promise.all([
        fetchCohortBooks(session.eventConfig?.id || 'event-2026-10-seoul-forest'),
        fetchNotifications(),
        fetchMyBookletDraft(),
      ]);
      setBooks(loadedBooks);
      setNotifications(loadedNotifs);
      setMyDraft(draftData.draft);
      setMySubmitted(draftData.submitted);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const handleSwitchUser = async (uid: string) => {
    try {
      const updatedUser = await switchUserSession(uid);
      setSession((prev) => (prev ? { ...prev, user: updatedUser } : null));
      if (updatedUser.readingFontPreset) {
        setReadingFontPreset(updatedUser.readingFontPreset);
      }
      await handleRefresh();
    } catch (err) {
      console.error('User switch error:', err);
    }
  };

  const handleNewUserRegistered = async (newUser: UserAccount) => {
    try {
      const updatedUser = await switchUserSession(newUser.uid);
      setSession((prev) => (prev ? { ...prev, user: updatedUser } : null));
      setIsOnboardingModalOpen(true);
      await handleRefresh();
    } catch (err) {
      console.error('New user registration switch error:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetDemoData();
      await loadInitialData();
    } catch (err) {
      console.error('Demo reset error:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center space-y-4 font-ui">
        <div className="w-8 h-8 border-2 border-[#58614C] border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-book-maruburi text-[#272B29]">
          사람책 서가를 펼치는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#272B29] flex flex-col antialiased selection:bg-[#EADBCC] selection:text-[#272B29]">
      {/* Top Demo Persona Switcher Banner */}
      <DemoBanner
        currentUser={session.user}
        onSwitchUser={handleSwitchUser}
        onResetDemo={handleResetDemo}
        hasGeminiKey={session.hasGeminiKey}
      />

      {/* Main Top Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={session.user}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCohortInfo={() => setIsCohortInfoOpen(true)}
        onOpenFontSettings={() => setIsFontSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentFont={readingFontPreset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {currentTab === 'bookshelf' && (
          <BookshelfView
            books={books}
            currentEventTitle={session.eventConfig?.title}
            onOpenBook={(book) => setSelectedBookForReading(book)}
            currentUserUid={session.user.uid}
            myDraft={myDraft}
            mySubmitted={mySubmitted}
            onNavigateToAuthoring={() => setCurrentTab('my-booklet')}
            readingFontPreset={readingFontPreset}
          />
        )}

        {currentTab === 'my-booklet' && (
          <BookletAuthoringView
            currentUserUid={session.user.uid}
            onPublished={async () => {
              await handleRefresh();
            }}
            readingFontPreset={readingFontPreset}
          />
        )}

        {currentTab === 'admin' && <AdminView />}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-subtle py-8 px-4 text-center text-xs text-[#686B65] font-book-maruburi bg-[#F8F7F3]">
        <div className="max-w-5xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-4 text-[#272B29] font-ui">
            <button
              onClick={() => setIsCohortInfoOpen(true)}
              className="hover:underline cursor-pointer"
            >
              행사 안내 및 규약
            </button>
            <span>·</span>
            <button
              onClick={() => setIsFontSettingsOpen(true)}
              className="hover:underline cursor-pointer"
            >
              글꼴 설정
            </button>
            <span>·</span>
            <span>2026 가을 서울숲</span>
            <span>·</span>
            <span>오프라인 4:4 산책 로테이션</span>
          </div>
          <p className="text-[#686B65] text-[11px]">
            사람책 · 사람을 읽는 책장 · 4면 가치관 소개 책자와 서울숲 산책
          </p>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {selectedBookForReading && (
        <BookletReader
          book={selectedBookForReading}
          isOpen={Boolean(selectedBookForReading)}
          onClose={() => setSelectedBookForReading(null)}
          isSelf={selectedBookForReading.authorUid === session.user.uid}
          readerFontPreset={readingFontPreset}
          onOpenFontSettings={() => setIsFontSettingsOpen(true)}
        />
      )}

      {isCohortInfoOpen && (
        <CohortBriefingModal
          cohort={session.eventConfig}
          currentUser={session.user}
          isOpen={isCohortInfoOpen}
          onClose={() => setIsCohortInfoOpen(false)}
          onSaveAttestation={(attested) => {
            setSession((prev) =>
              prev ? { ...prev, user: { ...prev.user, adultSelfAttested: attested } } : null
            );
          }}
        />
      )}

      {isNotificationsOpen && (
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onRefresh={handleRefresh}
        />
      )}

      {isFontSettingsOpen && (
        <FontSettingsModal
          isOpen={isFontSettingsOpen}
          onClose={() => setIsFontSettingsOpen(false)}
          currentPreset={readingFontPreset}
          onSelectPreset={(newPreset) => {
            setReadingFontPreset(newPreset);
            handleRefresh();
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={session.user}
          onSwitchUser={handleSwitchUser}
          onNewUserRegistered={handleNewUserRegistered}
        />
      )}

      {isOnboardingModalOpen && (
        <OnboardingModal
          isOpen={isOnboardingModalOpen}
          currentUser={session.user}
          onClose={() => setIsOnboardingModalOpen(false)}
          onCompleted={async (updated: UserAccount) => {
            setSession((prev) => (prev ? { ...prev, user: updated } : null));
            setIsOnboardingModalOpen(false);
            await handleRefresh();
          }}
        />
      )}
    </div>
  );
}
