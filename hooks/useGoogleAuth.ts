import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../stores/useStore';

// Google API 타입 선언
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: { apiKey?: string; discoveryDocs: string[] }) => Promise<void>;
        load: (api: string, version: string) => Promise<void>;
        calendar: {
          events: {
            insert: (params: { calendarId: string; resource: CalendarEvent }) => Promise<{ result: { id: string } }>;
            update: (params: { calendarId: string; eventId: string; resource: CalendarEvent }) => Promise<{ result: { id: string } }>;
            delete: (params: { calendarId: string; eventId: string }) => Promise<void>;
          };
        };
        setToken: (token: { access_token: string }) => void;
      };
    };
  }
}

interface TokenResponse {
  access_token: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: () => void;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

// 환경변수에서 Client ID 가져오기
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

export const useGoogleAuth = () => {
  const { settings, setGoogleConnected } = useStore();
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isGisLoaded, setIsGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GAPI 클라이언트 초기화
  const initializeGapiClient = useCallback(async () => {
    try {
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      });

      // Calendar API 명시적 로드
      await window.gapi.client.load('calendar', 'v3');
      console.log('Google Calendar API 로드 완료');

      setIsGapiLoaded(true);

      // 저장된 토큰이 있으면 복원
      if (settings.googleAccessToken) {
        window.gapi.client.setToken({ access_token: settings.googleAccessToken });
        console.log('저장된 토큰 복원됨');
      }
    } catch (err) {
      console.error('GAPI 초기화 실패:', err);
      setError('Google API 초기화에 실패했습니다.');
    }
  }, [settings.googleAccessToken]);

  // GAPI 로드
  useEffect(() => {
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('client', initializeGapiClient);
      } else {
        // gapi가 아직 로드되지 않았으면 재시도
        setTimeout(loadGapi, 100);
      }
    };
    loadGapi();
  }, [initializeGapiClient]);

  // GIS (Google Identity Services) 초기화
  useEffect(() => {
    const initializeGis = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: TokenResponse) => {
            if (response.error) {
              console.error('OAuth 에러:', response.error);
              setError('로그인에 실패했습니다.');
              setIsLoading(false);
              return;
            }

            // 토큰 저장 및 gapi에 설정
            window.gapi.client.setToken({ access_token: response.access_token });
            setGoogleConnected(true, response.access_token);
            setIsLoading(false);
            setError(null);
          },
        });
        setTokenClient(client);
        setIsGisLoaded(true);
      } else {
        // GIS가 아직 로드되지 않았으면 재시도
        setTimeout(initializeGis, 100);
      }
    };
    initializeGis();
  }, [setGoogleConnected]);

  // 로그인 함수
  const signIn = useCallback(() => {
    if (!CLIENT_ID) {
      setError('Google Client ID가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
      return;
    }

    if (!tokenClient) {
      setError('인증 클라이언트가 준비되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    tokenClient.requestAccessToken();
  }, [tokenClient]);

  // 로그아웃 함수
  const signOut = useCallback(() => {
    if (settings.googleAccessToken && window.google?.accounts?.oauth2) {
      // 토큰 해제 (선택사항)
      window.gapi.client.setToken({ access_token: '' });
    }
    setGoogleConnected(false, undefined);
  }, [settings.googleAccessToken, setGoogleConnected]);

  return {
    isReady: isGapiLoaded && isGisLoaded,
    isConnected: settings.googleConnected,
    isLoading,
    error,
    signIn,
    signOut,
  };
};
