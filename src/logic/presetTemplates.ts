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

export const PRESET_TEMPLATES: Template[] = [
  CATAN_TEMPLATE,
  TICKET_TO_RIDE_TEMPLATE,
  GOLF_TEMPLATE,
  MONOPOLY_TEMPLATE,
];
