import { EventStore, CalendarEvent, RoutineStore, LFGStore, Group } from '../src/lib/state'
import { Routine } from '../src/lib/routine'
import { User, Client } from 'discord.js'

const testEvent: CalendarEvent = {
  guid: 'newEvent',
  title: 'Test',
  date: new Date(),
  link: '',
  img: '',
  group: '',
  reminders: new Map([['x', false]])
}

const testRoutine: Routine<void> = new Routine(() => Promise.resolve(), [], 36000)

const testGroup: Group = {
  id: 0,
  owner: new User(new Client(), { username: 'tester' }),
  name: 'test',
  needed: 2,
  found: []
}

describe('EventStore', () => {
  test('Empty on Creation', () => {
    expect(EventStore.getEvents().length).toBe(0)
  })

  test('Add', () => {
    EventStore.add('newEvent', testEvent)
    expect(EventStore.getEvents().length).toBe(1)
    EventStore.add('newEvent', testEvent)
    expect(EventStore.getEvents().length).toBe(1)
  })

  test('Has', () => {
    expect(EventStore.has('newEvent')).toBeTruthy()
  })

  test('Get Events', () => {
    expect(EventStore.getEvents()).toContain(testEvent)
  })

  test('Remove If Old', () => {
    expect(EventStore.removeIfOld('newEvent')).toBeFalsy()

    const g = EventStore.getEvents().find(e => e.guid === 'newEvent')
    ;[...g!.reminders.keys()].forEach(k => {
      g!.reminders.set(k, true)
    })

    expect(EventStore.removeIfOld('newEvent')).toBeTruthy()
    expect(EventStore.getEvents().length).toBe(0)
  })
})

describe('RoutineStore', () => {
  test('Add', () => {
    RoutineStore.add('newRoutine', testRoutine)
    RoutineStore.add('newRoutine', testRoutine)
    expect(true).toBeTruthy()
  })

  test('Terminate', () => {
    RoutineStore.terminate('newRoutine')
    RoutineStore.terminate('oldRoutine')
    expect(true).toBeTruthy()
  })
})

describe('LFGStore', () => {
  test('Empty on Creation', () => {
    expect(LFGStore.getGroups().length).toBe(0)
  })

  test('Add', () => {
    LFGStore.add(testGroup)
    expect(LFGStore.getGroups().length).toBe(1)
    LFGStore.add(testGroup)
    expect(LFGStore.getGroups().length).toBe(1)
  })

  test('User Already Looking', () => {
    expect(LFGStore.userAlreadyLooking('tester')).toBeTruthy()
    expect(LFGStore.userAlreadyLooking('tester2')).toBeFalsy()
  })

  test('Join', () => {
    let res = LFGStore.join(new User(new Client(), {}), -1)
    expect(res.full).toBeFalsy()
    expect(res.group).toBeUndefined()

    res = LFGStore.join(new User(new Client(), {}), 0)
    expect(res.full).toBeFalsy()
    expect(res.group).toBeTruthy()

    res = LFGStore.join(new User(new Client(), {}), 0)
    expect(res.full).toBeTruthy()
    expect(res.group).toBeTruthy()
  })

  test('Remove', () => {
    LFGStore.remove(0)
    expect(LFGStore.getGroups().length).toBe(0)
  })
})
