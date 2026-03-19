import { test, expect } from '@playwright/test'

const poster = (text: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
      <defs>
        <style>
          .t { font: 700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial; fill: #fff; }
        </style>
      </defs>
      <rect width="300" height="450" fill="#0f172a" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="t">${text}</text>
    </svg>`,
  )}`

const mockListDocsPage1 = [
  {
    id: 1,
    name: 'Интерстеллар',
    year: 2014,
    rating: { kp: 8.6 },
    genres: [{ name: 'фантастика' }, { name: 'драма' }],
    poster: { previewUrl: poster('Интерстеллар') },
    movieLength: 169,
  },
  {
    id: 2,
    name: 'Начало',
    year: 2010,
    rating: { kp: 8.7 },
    genres: [{ name: 'боевик' }, { name: 'триллер' }],
    poster: { previewUrl: poster('Начало') },
    movieLength: 148,
  },
] as const

const mockListDocsPage2 = [
  {
    id: 3,
    name: 'Матрица',
    year: 1999,
    rating: { kp: 8.5 },
    genres: [{ name: 'фантастика' }, { name: 'боевик' }],
    poster: { previewUrl: poster('Матрица') },
    movieLength: 136,
  },
] as const

type MockApiMovie = {
  id: number
  name: string
  year?: number
  rating?: { kp?: number }
  genres?: { name: string }[]
  poster?: { url?: string; previewUrl?: string }
  movieLength?: number
  description?: string
  premiere?: { world?: string }
  alternativeName?: string
}

const mockMovieDetailsById: Record<number, MockApiMovie> = {
  1: {
    id: 1,
    name: 'Интерстеллар',
    year: 2014,
    rating: { kp: 8.6 },
    genres: [{ name: 'фантастика' }, { name: 'драма' }],
    poster: { previewUrl: poster('Интерстеллар') },
    movieLength: 169,
    description: 'Описание Интерстеллар.',
    premiere: { world: '2014-11-05T00:00:00.000Z' },
    alternativeName: 'Interstellar',
  },
  2: {
    id: 2,
    name: 'Начало',
    year: 2010,
    rating: { kp: 8.7 },
    genres: [{ name: 'боевик' }, { name: 'триллер' }],
    poster: { previewUrl: poster('Начало') },
    movieLength: 148,
    description: 'Описание Начало.',
    premiere: { world: '2010-07-16T00:00:00.000Z' },
    alternativeName: 'Inception',
  },
  3: {
    id: 3,
    name: 'Матрица',
    year: 1999,
    rating: { kp: 8.5 },
    genres: [{ name: 'фантастика' }, { name: 'боевик' }],
    poster: { previewUrl: poster('Матрица') },
    movieLength: 136,
    description: 'Описание Матрица.',
    premiere: { world: '1999-03-31T00:00:00.000Z' },
    alternativeName: 'The Matrix',
  },
}

type MockListDoc = (typeof mockListDocsPage1)[number]

const moviesTotal = 3
const moviesPages = 2

test.describe('Movies E2E', () => {
  test.beforeEach(async ({ page }) => {
    const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    await page.addInitScript(
      (id: string) => {
        // favorites хранятся в localStorage и должны переживать `page.reload()`.
        // Поэтому localStorage очищаем один раз на старт теста.
        try {
          const currentRunId = sessionStorage.getItem('__e2e_runId')
          if (currentRunId !== id) {
            window.localStorage.clear()
            sessionStorage.setItem('__e2e_runId', id)
          }
        } catch {
          // ignore (localStorage может быть недоступен в некоторых средах)
        }
      },
      runId,
    )

    page.route('**/v1.4/movie**', async (route) => {
      const url = new URL(route.request().url())
      const path = url.pathname

      // Details: /v1.4/movie/:id
      const detailsMatch = path.match(/\/v1\.4\/movie\/(\d+)/)
      if (detailsMatch) {
        const id = Number(detailsMatch[1])
        const data = mockMovieDetailsById[id]
        return route.fulfill({
          status: 200,
          json: data,
        })
      }

      // List: /v1.4/movie?page=...
      const pageParam = url.searchParams.get('page')
      let requestedPage = Number(pageParam ?? '1')
      if (!Number.isFinite(requestedPage) || requestedPage < 1) requestedPage = 1
      const docsByPage: Record<number, MockListDoc[]> = {
        1: [...mockListDocsPage1],
        2: [...mockListDocsPage2],
      }

      const docs = docsByPage[requestedPage] ?? []

      return route.fulfill({
        status: 200,
        json: {
          docs,
          total: moviesTotal,
          page: requestedPage,
          pages: moviesPages,
        },
      })
    })

    // Basic start page (domcontentloaded гарантирует быстрый старт UI)
    await page.goto('/movies', { waitUntil: 'domcontentloaded', timeout: 10_000 })
  })

  test('shows movie cards after initial load', async ({ page }) => {
    await expect(page.getByPlaceholder('Название фильма')).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('heading', { name: 'Интерстеллар', level: 3 })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'Начало', level: 3 })).toBeVisible({ timeout: 10_000 })
  })

  test('infinite scroll loads next page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Интерстеллар', level: 3 })).toBeVisible({ timeout: 10_000 })

    const sentinel = page.locator('.infinite-scroller__sentinel')
    await sentinel.scrollIntoViewIfNeeded()

    await expect(page.getByRole('heading', { name: 'Матрица', level: 3 })).toBeVisible({ timeout: 10_000 })
  })

  test('search query filters results and shows empty message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Интерстеллар', level: 3 })).toBeVisible({ timeout: 10_000 })

    await page.getByPlaceholder('Название фильма').fill('несуществующий_фильм_zzzz')
    await expect(page.getByText('По запросу ничего не найдено среди загруженных результатов')).toBeVisible()
  })

  test('add to favorites requires confirmation and persists after reload', async ({ page }) => {
    const interstellarCard = page.locator('.movie-card', { has: page.getByRole('heading', { name: 'Интерстеллар', level: 3 }) }).first()
    const addButton = interstellarCard.getByRole('button', { name: 'В избранное' })
    await expect(addButton).toBeVisible()

    await addButton.click()

    const favoriteModal = page.getByRole('dialog', { name: 'Добавить фильм в избранное?' })
    await expect(favoriteModal).toBeVisible()
    await favoriteModal.getByRole('button', { name: 'Добавить' }).click()
    await expect(favoriteModal).toBeHidden()
    await expect(interstellarCard.getByRole('button', { name: 'Убрать из избранного' })).toBeVisible()

    await page.getByRole('link', { name: 'Избранное' }).click()
    await expect(page.getByRole('heading', { name: 'Избранные фильмы' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Интерстеллар', level: 3 })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Избранные фильмы' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Интерстеллар', level: 3 })).toBeVisible()
  })

  test('favorites modal cancel keeps movie out of favorites', async ({ page }) => {
    const interstellarCard = page.locator('.movie-card', { has: page.getByRole('heading', { name: 'Интерстеллар', level: 3 }) }).first()
    await interstellarCard.getByRole('button', { name: 'В избранное' }).click()

    const favoriteModal = page.getByRole('dialog', { name: 'Добавить фильм в избранное?' })
    await expect(favoriteModal).toBeVisible()

    await favoriteModal.getByRole('button', { name: 'Отмена' }).click()
    await expect(favoriteModal).toBeHidden()

    // Фаворит не должен добавиться (кнопка остается в состоянии "В избранное")
    await expect(interstellarCard.getByRole('button', { name: 'В избранное' })).toBeVisible()

    await page.reload()
    await expect(interstellarCard.getByRole('button', { name: 'В избранное' })).toBeVisible()
  })

  test('remove from favorites requires confirmation and shows empty state', async ({ page }) => {
    const interstellarCard = page.locator('.movie-card', { has: page.getByRole('heading', { name: 'Интерстеллар', level: 3 }) }).first()

    await interstellarCard.getByRole('button', { name: 'В избранное' }).click()
    await page.getByRole('dialog', { name: 'Добавить фильм в избранное?' }).getByRole('button', { name: 'Добавить' }).click()

    await page.getByRole('link', { name: 'Избранное' }).click()
    await expect(page.getByRole('heading', { name: 'Избранные фильмы' })).toBeVisible()

    const favoritesMovieCard = page
      .locator('.movie-card', { has: page.getByRole('heading', { name: 'Интерстеллар', level: 3 }) })
      .first()

    await favoritesMovieCard.getByRole('button', { name: 'Убрать из избранного' }).click()

    const removeModal = page.getByRole('dialog', { name: 'Удалить фильм из избранного?' })
    await expect(removeModal).toBeVisible()
    await removeModal.getByRole('button', { name: 'Удалить' }).click()
    await expect(removeModal).toBeHidden()

    await expect(page.getByText('У вас пока нет избранных фильмов. Добавьте их на странице списка фильмов.')).toBeVisible()
  })

  test('compare keeps only two last selections and supports collapse', async ({ page }) => {
    const compareForMovie = (title: string) =>
      page
        .locator('.movie-card', { has: page.getByRole('heading', { name: title, level: 3 }) })
        .first()
        .getByRole('button', { name: 'Сравнить' })

    const comparePanel = page.locator('.compare-panel')

    await compareForMovie('Интерстеллар').click({ force: true })
    await expect(comparePanel.getByRole('link', { name: 'Интерстеллар', exact: true })).toBeVisible({ timeout: 10_000 })

    await page
      .locator('.movie-card', { has: page.getByRole('heading', { name: 'Начало', level: 3 }) })
      .first()
      .getByRole('button', { name: 'Сравнить' })
      .click({ force: true })

    // После выбора третьего фильма сравнение должно оставить только последние две карточки.
    await expect(
      page
        .locator('.movie-card', { has: page.getByRole('heading', { name: 'Начало', level: 3 }) })
        .getByRole('button', { name: 'Убрать из сравнения' })
        .first(),
    ).toBeVisible({ timeout: 10_000 })

    await expect(comparePanel.getByRole('link', { name: 'Интерстеллар', exact: true })).toBeVisible({ timeout: 10_000 })
    await expect(comparePanel.getByRole('link', { name: 'Начало', exact: true })).toBeVisible({ timeout: 10_000 })

    // 3rd selection should drop first and keep second+third
    const sentinel = page.locator('.infinite-scroller__sentinel')
    await sentinel.scrollIntoViewIfNeeded()
    await page
      .locator('.movie-card', { has: page.getByRole('heading', { name: 'Матрица', level: 3 }) })
      .first()
      .getByRole('button', { name: 'Сравнить' })
      .click({ force: true })

    await expect(comparePanel.getByRole('link', { name: 'Начало', exact: true })).toBeVisible()
    await expect(comparePanel.getByRole('link', { name: 'Матрица', exact: true })).toBeVisible()
    await expect(comparePanel.getByRole('link', { name: 'Интерстеллар', exact: true })).not.toBeVisible()

    // collapse/expand sanity
    await page.getByRole('button', { name: 'Скрыть' }).click()
    await expect(page.getByRole('button', { name: 'Показать (2)' })).toBeVisible()
  })

  test('movie details page shows description and genres', async ({ page }) => {
    await page
      .locator('.movie-card', { has: page.getByRole('heading', { name: 'Интерстеллар', level: 3 }) })
      .first()
      .getByRole('link')
      .click()
    await page.waitForURL(/\/movies\/1/)
    await expect(page.getByRole('heading', { name: 'Интерстеллар', level: 1 })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'Описание' })).toBeVisible()
    await expect(page.getByText('Описание Интерстеллар.', { exact: true })).toBeVisible()
    await expect(page.getByText(/Жанры:/)).toBeVisible()
  })
})

