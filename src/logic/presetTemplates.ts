import type { Template } from './types';

export const CATAN_TEMPLATE: Template = {
  id: 'preset-catan',
  name: 'Catan',
  categories: [
    { id: 'catan-settlements', name: 'Settlements', key: 'settlements' },
    { id: 'catan-cities', name: 'Cities', key: 'cities' },
    { id: 'catan-longest-road', name: 'Longest Road', key: 'longestRoad' },
    { id: 'catan-largest-army', name: 'Largest Army', key: 'largestArmy' },
    { id: 'catan-dev-cards', name: 'Development Cards', key: 'developmentCards' },
    { id: 'catan-other', name: 'Other', key: 'other' },
  ],
  formula: null,
  winDirection: 'high',
  builtIn: true,
};

export const TICKET_TO_RIDE_TEMPLATE: Template = {
  id: 'preset-ticket-to-ride',
  name: 'Ticket to Ride',
  categories: [
    { id: 'ttr-routes', name: 'Routes', key: 'routes' },
    { id: 'ttr-longest-route', name: 'Longest Route Bonus', key: 'longestRouteBonus' },
    { id: 'ttr-completed', name: 'Completed Tickets', key: 'completedTickets' },
    { id: 'ttr-incomplete', name: 'Incomplete Tickets Penalty', key: 'incompleteTicketsPenalty' },
  ],
  formula: 'routes + longestRouteBonus + completedTickets - incompleteTicketsPenalty',
  winDirection: 'high',
  builtIn: true,
};

export const GOLF_TEMPLATE: Template = {
  id: 'preset-golf',
  name: 'Golf (card game)',
  categories: [{ id: 'golf-points', name: 'Points', key: 'points' }],
  formula: null,
  winDirection: 'low',
  builtIn: true,
};

export const MONOPOLY_TEMPLATE: Template = {
  id: 'preset-monopoly',
  name: 'Monopoly',
  categories: [
    { id: 'monopoly-cash', name: 'Cash', key: 'cash' },
    { id: 'monopoly-property', name: 'Property Value', key: 'propertyValue' },
    { id: 'monopoly-buildings', name: 'Buildings', key: 'buildings' },
    { id: 'monopoly-mortgages', name: 'Mortgages (Penalty)', key: 'mortgagesPenalty' },
  ],
  formula: 'cash + propertyValue + buildings - mortgagesPenalty',
  winDirection: 'high',
  builtIn: true,
};

export const YAHTZEE_TEMPLATE: Template = {
  id: 'preset-yahtzee',
  name: 'Yahtzee',
  categories: [
    { id: 'yahtzee-aces', name: 'Aces', key: 'aces' },
    { id: 'yahtzee-twos', name: 'Twos', key: 'twos' },
    { id: 'yahtzee-threes', name: 'Threes', key: 'threes' },
    { id: 'yahtzee-fours', name: 'Fours', key: 'fours' },
    { id: 'yahtzee-fives', name: 'Fives', key: 'fives' },
    { id: 'yahtzee-sixes', name: 'Sixes', key: 'sixes' },
    { id: 'yahtzee-upper-bonus', name: 'Upper Bonus', key: 'upperBonus', pointValue: 35 },
    { id: 'yahtzee-three-of-a-kind', name: 'Three of a Kind', key: 'threeOfAKind' },
    { id: 'yahtzee-four-of-a-kind', name: 'Four of a Kind', key: 'fourOfAKind' },
    { id: 'yahtzee-full-house', name: 'Full House', key: 'fullHouse', pointValue: 25 },
    { id: 'yahtzee-small-straight', name: 'Small Straight', key: 'smallStraight', pointValue: 30 },
    { id: 'yahtzee-large-straight', name: 'Large Straight', key: 'largeStraight', pointValue: 40 },
    { id: 'yahtzee-yahtzee', name: 'Yahtzee', key: 'yahtzee', pointValue: 50 },
    { id: 'yahtzee-chance', name: 'Chance', key: 'chance' },
    { id: 'yahtzee-yahtzee-bonus', name: 'Yahtzee Bonus', key: 'yahtzeeBonus', pointValue: 100 },
  ],
  formula: null,
  winDirection: 'high',
  builtIn: true,
  scoringReference: [
    { label: 'Upper Section Bonus', points: '35 (if upper section total ≥ 63)' },
    { label: 'Three of a Kind / Four of a Kind / Chance', points: 'sum of all 5 dice' },
    { label: 'Full House', points: '25' },
    { label: 'Small Straight', points: '30' },
    { label: 'Large Straight', points: '40' },
    { label: 'Yahtzee', points: '50' },
    { label: 'Yahtzee Bonus', points: '100 (each extra Yahtzee, after the first is scored)' },
  ],
};

export const FARKLE_TEMPLATE: Template = {
  id: 'preset-farkle',
  name: 'Farkle',
  categories: [{ id: 'farkle-turn-points', name: 'Turn Points', key: 'turnPoints' }],
  formula: null,
  winDirection: 'high',
  builtIn: true,
  scoringReference: [
    { label: 'Single 1', points: '100' },
    { label: 'Single 5', points: '50' },
    { label: 'Three 1s', points: '1000' },
    { label: 'Three 2s', points: '200' },
    { label: 'Three 3s', points: '300' },
    { label: 'Three 4s', points: '400' },
    { label: 'Three 5s', points: '500' },
    { label: 'Three 6s', points: '600' },
    { label: 'Four of a Kind', points: '1000' },
    { label: 'Five of a Kind', points: '2000' },
    { label: 'Six of a Kind', points: '3000' },
    { label: 'Straight (1-6)', points: '1500' },
    { label: 'Three Pairs', points: '1500' },
    { label: 'Two Triplets', points: '2500' },
    { label: 'Farkle (no scoring dice)', points: '0 — turn ends, lose unbanked points' },
  ],
};

export const PRESET_TEMPLATES: Template[] = [
  CATAN_TEMPLATE,
  TICKET_TO_RIDE_TEMPLATE,
  GOLF_TEMPLATE,
  MONOPOLY_TEMPLATE,
  YAHTZEE_TEMPLATE,
  FARKLE_TEMPLATE,
];
