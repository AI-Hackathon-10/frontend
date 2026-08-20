import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import useAudioRecorder from '../hooks/useAudioRecorder.js'
import { synthesizeSpeech, transcribeAudio, recommendByVoice } from '../api/voiceApi.js'

const QUESTIONS = {
  SYMPTOM: '안녕하세요! 어떤 증상이 있으신가요?',
  ONSET: '언제부터 증상이 시작됐나요?',
  LOADING: '적합한 약을 찾고 있어요...',
}

// Whisper가 무음/잡음에서 생성하는 대표적 환각 패턴
const HALLUCINATION_PATTERNS = [
  '시청해', '구독', '좋아요', '영상', '감사합니다',
  '봐주셔서', '채널', '알림', '눌러', '부탁드립니다',
  'thank', 'subscribe', 'like', 'comment',
  'MBC', 'KBS', 'SBS', 'jtbc',
]

function isHallucination(text) {
  if (!text || text.trim().length < 2) return true
  const lower = text.toLowerCase()
  const matchCount = HALLUCINATION_PATTERNS.filter((p) => lower.includes(p.toLowerCase())).length
  return matchCount >= 2
}

const PHASES = {
  IDLE: 'IDLE',
  ASK_SYMPTOM: 'ASK_SYMPTOM',
  LISTEN_SYMPTOM: 'LISTEN_SYMPTOM',
  ASK_ONSET: 'ASK_ONSET',
  LISTEN_ONSET: 'LISTEN_ONSET',
  LOADING: 'LOADING',
  RESULT: 'RESULT',
  ERROR: 'ERROR',
}

function formatTimer(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function VoiceRecommendPage() {
  const [phase, setPhase] = useState(PHASES.IDLE)
  const [messages, setMessages] = useState([])
  const [symptomText, setSymptomText] = useState('')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const chatEndRef = useRef(null)
  const phaseRef = useRef(phase)
  const audioCtxRef = useRef(null)

  const recorder = useAudioRecorder()

  phaseRef.current = phase

  // Web Audio API — 사용자 제스처 시점에 AudioContext를 생성하면
  // 이후 비동기 호출 이후에도 오디오 재생이 차단되지 않음
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { role, text, id: Date.now() + Math.random() }])
  }, [])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  const playTts = useCallback(async (text) => {
    try {
      const ctx = getAudioContext()
      if (ctx.state === 'suspended') await ctx.resume()

      const blob = await synthesizeSpeech(text)
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(ctx.destination)
      source.start(0)

      await new Promise((resolve) => {
        source.onended = resolve
      })
    } catch (err) {
      console.error('TTS 재생 실패:', err)
      // TTS 실패해도 텍스트 말풍선은 이미 표시되어 있으므로 진행
    }
  }, [getAudioContext])

  // "대화 시작하기" 버튼 클릭 — 사용자 제스처로 AudioContext 생성
  const handleStart = useCallback(async () => {
    getAudioContext() // 사용자 제스처 안에서 AudioContext 생성 (잠금 해제)

    setPhase(PHASES.ASK_SYMPTOM)
    addMessage('ai', QUESTIONS.SYMPTOM)
    scrollToBottom()
    await playTts(QUESTIONS.SYMPTOM)
    setPhase(PHASES.LISTEN_SYMPTOM)
  }, [addMessage, scrollToBottom, playTts, getAudioContext])

  // 녹음 자동 시작
  useEffect(() => {
    if (phase === PHASES.LISTEN_SYMPTOM || phase === PHASES.LISTEN_ONSET) {
      recorder.resetRecording()
      const timeout = setTimeout(() => {
        recorder.startRecording()
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // 녹음 완료 → STT
  useEffect(() => {
    if (!recorder.audioBlob) return
    const currentPhase = phaseRef.current
    if (currentPhase !== PHASES.LISTEN_SYMPTOM && currentPhase !== PHASES.LISTEN_ONSET) return

    let cancelled = false

    async function processAudio() {
      try {
        const { text } = await transcribeAudio(recorder.audioBlob)
        if (cancelled) return

        if (!text || !text.trim() || isHallucination(text)) {
          // 환각이거나 빈 결과 → 다시 듣기
          const retryMsg = currentPhase === PHASES.LISTEN_SYMPTOM
            ? '잘 듣지 못했어요. 증상을 다시 말씀해 주세요.'
            : '잘 듣지 못했어요. 다시 말씀해 주세요.'
          addMessage('ai', retryMsg)
          scrollToBottom()
          await playTts(retryMsg)
          if (!cancelled) {
            // 같은 phase로 재설정하여 녹음 다시 시작
            setPhase(PHASES.IDLE) // 잠깐 다른 상태로
            setTimeout(() => {
              if (!cancelled) setPhase(currentPhase)
            }, 100)
          }
          return
        }

        addMessage('user', text)
        scrollToBottom()

        if (currentPhase === PHASES.LISTEN_SYMPTOM) {
          setSymptomText(text)
          setPhase(PHASES.ASK_ONSET)
          addMessage('ai', QUESTIONS.ONSET)
          scrollToBottom()
          await playTts(QUESTIONS.ONSET)
          if (!cancelled) setPhase(PHASES.LISTEN_ONSET)
        } else {
          // LISTEN_ONSET → 추천 요청
          setPhase(PHASES.LOADING)
          addMessage('ai', QUESTIONS.LOADING)
          scrollToBottom()

          const recommendation = await recommendByVoice(symptomText, text)
          if (cancelled) return
          setResult(recommendation)
          setPhase(PHASES.RESULT)
          scrollToBottom()
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
          setPhase(PHASES.ERROR)
        }
      }
    }

    processAudio()
    return () => { cancelled = true }
  }, [recorder.audioBlob]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = useCallback(() => {
    setMessages([])
    setSymptomText('')
    setResult(null)
    setErrorMsg('')
    recorder.resetRecording()
    setPhase(PHASES.IDLE)
  }, [recorder])

  const isListening = phase === PHASES.LISTEN_SYMPTOM || phase === PHASES.LISTEN_ONSET

  return (
    <div className="page page--voice">
      <header className="page-header">
        <Link className="page-header__back" to="/">
          <Icon name="arrowLeft" size={18} />
        </Link>
        <h1>음성으로 약 추천받기</h1>
      </header>

      <div className="voice-chat">
        {phase === PHASES.IDLE && messages.length === 0 && (
          <div className="voice-chat__start">
            <div className="voice-chat__start-icon">
              <Icon name="mic" size={40} />
            </div>
            <h2>AI와 음성으로 대화해 보세요</h2>
            <p>증상을 말씀하시면 적합한 약을 추천해 드려요</p>
            <button className="btn btn--primary btn--large" onClick={handleStart} type="button">
              대화 시작하기
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div className={`voice-chat__bubble voice-chat__bubble--${msg.role}`} key={msg.id}>
            <span className="voice-chat__bubble-label">{msg.role === 'ai' ? 'AI' : '나'}</span>
            <p>{msg.text}</p>
          </div>
        ))}

        {phase === PHASES.ASK_SYMPTOM && (
          <div className="voice-chat__tts-playing">
            <div className="voice-wave">
              <span /><span /><span /><span /><span />
            </div>
            <small>AI가 말하고 있어요...</small>
          </div>
        )}

        {isListening && (
          <div className="voice-chat__recorder">
            {recorder.isRecording ? (
              <>
                <div className="voice-wave voice-wave--recording">
                  <span /><span /><span /><span /><span />
                </div>
                <span className="voice-chat__timer">{formatTimer(recorder.elapsedMs)}</span>
                <button className="voice-record-button voice-record-active" onClick={recorder.stopRecording} type="button">
                  <Icon name="mic" size={32} />
                </button>
                <small className="voice-chat__hint">버튼을 누르면 녹음이 종료됩니다</small>
              </>
            ) : (
              <p className="voice-chat__preparing">녹음을 준비하고 있어요...</p>
            )}
            {recorder.error && <p className="voice-chat__error">{recorder.error}</p>}
          </div>
        )}

        {phase === PHASES.ASK_ONSET && (
          <div className="voice-chat__tts-playing">
            <div className="voice-wave">
              <span /><span /><span /><span /><span />
            </div>
            <small>AI가 말하고 있어요...</small>
          </div>
        )}

        {phase === PHASES.LOADING && (
          <div className="voice-chat__loading">
            <div className="voice-result__spinner" />
          </div>
        )}

        {phase === PHASES.ERROR && (
          <div className="voice-chat__error-area">
            <p>{errorMsg}</p>
            <button className="btn btn--primary" onClick={handleRetry} type="button">다시 시도하기</button>
          </div>
        )}

        {phase === PHASES.RESULT && result && (
          <div className="voice-chat__result">
            {result.parsedSymptoms?.length > 0 && (
              <div className="voice-result__symptoms">
                <p className="voice-result__label">인식된 증상</p>
                <div className="voice-result__tags">
                  {result.parsedSymptoms.map((s) => (
                    <span className="voice-result__tag" key={s}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.candidates?.length > 0 ? (
              <div className="voice-result__candidates">
                {result.candidates.map((c) => (
                  <div className="voice-candidate-card" key={c.itemSeq}>
                    {c.imageUrl && <img alt={c.itemName} className="voice-candidate-card__img" src={c.imageUrl} />}
                    <div className="voice-candidate-card__body">
                      <span className="voice-candidate-card__name">{c.itemName}</span>
                      {c.recommendation && (
                        <span className={`voice-candidate-card__badge voice-candidate-card__badge--${c.recommendation.status === 'RECOMMENDED' ? 'recommended' : 'not_recommended'}`}>
                          {c.recommendation.status === 'RECOMMENDED' ? '추천' : '비추천'} · {Math.round(c.recommendation.score * 100)}%
                        </span>
                      )}
                      {c.official?.efficacy && <p className="voice-candidate-card__efficacy">{c.official.efficacy}</p>}
                      {c.recommendation?.reason && <p className="voice-candidate-card__reason">{c.recommendation.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="voice-result__empty">
                <Icon name="pill" size={28} />
                <p>추천할 약을 찾지 못했어요</p>
                <small>다른 증상으로 다시 시도해 보세요</small>
              </div>
            )}

            {result.notice && <p className="voice-result__notice">{result.notice}</p>}

            {result.disclaimer && (
              <p className="voice-result__disclaimer">
                <Icon name="shield" size={14} />
                {result.disclaimer}
              </p>
            )}

            <div className="voice-chat__retry-area">
              <button className="btn btn--primary" onClick={handleRetry} type="button">다시 추천받기</button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  )
}
