import { useState, useMemo } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  ChevronRight,
} from 'lucide-react';

// --- Types ---
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  image: string;
  category: 'Tech' | 'Design' | 'Business' | 'All';
  description: string;
  attendees?: number;
}

type TabType = 'upcoming' | 'saved' | 'past';
type CategoryType = 'All' | 'Tech' | 'Design' | 'Business';

// --- Mock Data ---
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: '2024-10-24',
    time: '9:00 AM - 5:00 PM',
    organizer: 'Tech Community Hub',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    category: 'Tech',
    description: 'Join industry leaders for a day of innovation, networking, and cutting-edge technology discussions. Features keynote speakers, workshops, and startup showcases.',
    attendees: 1200,
  },
  {
    id: '2',
    title: 'UX Design Career Fair',
    date: '2024-10-28',
    time: '10:00 AM - 4:00 PM',
    organizer: 'Design Professionals Network',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=400&fit=crop',
    category: 'Design',
    description: 'Connect with top design agencies and companies. Portfolio reviews, one-on-one sessions, and exclusive job opportunities for UX/UI designers.',
    attendees: 450,
  },
  {
    id: '3',
    title: 'Startup Hackathon Weekend',
    date: '2024-11-02',
    time: '6:00 PM - 6:00 PM (48hrs)',
    organizer: 'Hackathon Central',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop',
    category: 'Tech',
    description: 'Build your next big idea in 48 hours! Prizes worth $50K, mentorship from VCs, and networking with fellow entrepreneurs.',
    attendees: 300,
  },
  {
    id: '4',
    title: 'Business Leadership Webinar Series',
    date: '2024-10-20',
    time: '2:00 PM - 3:30 PM',
    organizer: 'Business Leaders Forum',
    location: 'Online',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    category: 'Business',
    description: 'Learn from C-suite executives about scaling businesses, strategic planning, and building high-performing teams. Interactive Q&A included.',
    attendees: 850,
  },
  {
    id: '5',
    title: 'AI & Machine Learning Conference',
    date: '2024-11-10',
    time: '8:00 AM - 6:00 PM',
    organizer: 'AI Research Institute',
    location: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    category: 'Tech',
    description: 'Deep dive into the latest AI/ML trends, research papers, and practical applications. Hands-on workshops and networking with researchers.',
    attendees: 2000,
  },
  {
    id: '6',
    title: 'Creative Portfolio Review Day',
    date: '2024-10-30',
    time: '11:00 AM - 5:00 PM',
    organizer: 'Creative Collective',
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop',
    category: 'Design',
    description: 'Get expert feedback on your portfolio from industry professionals. Perfect for designers looking to level up their presentation skills.',
    attendees: 200,
  },
];

// --- Main Component ---
function EventScout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabType>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [pastEvents, setPastEvents] = useState<Set<string>>(new Set());

  // Filter events based on tab, search, and category
  const filteredEvents = useMemo(() => {
    let events = [...mockEvents];

    // Filter by tab
    if (selectedTab === 'saved') {
      events = events.filter(event => savedEvents.has(event.id));
    } else if (selectedTab === 'past') {
      events = events.filter(event => pastEvents.has(event.id));
    } else {
      // For upcoming, filter out past events
      const today = new Date().toISOString().split('T')[0];
      events = events.filter(event => event.date >= today);
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      events = events.filter(event => event.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      events = events.filter(
        event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    return events;
  }, [searchQuery, selectedTab, selectedCategory, savedEvents, pastEvents]);

  // Toggle save/bookmark
  const toggleSave = (eventId: string) => {
    setSavedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Mark event as attended (move to past)
  const markAsAttended = (eventId: string) => {
    setPastEvents(prev => new Set(prev).add(eventId));
    setSavedEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[date.getMonth()],
      day: date.getDate(),
      full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  // Event Card Component
  const EventCard = ({ event }: { event: Event }) => {
    const dateInfo = formatDate(event.date);
    const isSaved = savedEvents.has(event.id);
    const isPast = pastEvents.has(event.id);

    return (
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="text-xs font-semibold text-slate-600">{dateInfo.month}</div>
            <div className="text-xl font-bold text-slate-900">{dateInfo.day}</div>
          </div>
          {/* Save/Bookmark Button */}
          <button
            onClick={() => toggleSave(event.id)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
            aria-label={isSaved ? 'Remove from saved' : 'Save event'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-slate-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-600" />
            )}
          </button>
          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-slate-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              {event.category}
            </span>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{event.title}</h3>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{event.description}</p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{dateInfo.full}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4 text-slate-500" />
              <span>{event.attendees?.toLocaleString()} attendees</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-slate-500 font-medium">by {event.organizer}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selectedTab === 'past' ? (
              <button
                className="flex-1 bg-slate-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-600 transition-colors"
                disabled
              >
                Attended
              </button>
            ) : (
              <>
                <button
                  className="flex-1 bg-slate-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-600 transition-colors"
                  onClick={() => {
                    // In a real app, this would open registration
                    alert(`Registering for ${event.title}...`);
                  }}
                >
                  Register
                  <ChevronRight className="w-4 h-4" />
                </button>
                {selectedTab === 'saved' && (
                  <button
                    onClick={() => markAsAttended(event.id)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Mark Attended
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/30 to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Career Event Scout</h1>
          <p className="text-slate-600 text-lg">Find and attend events to boost your network.</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by title, description, organizer, or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <div className="flex gap-2 flex-wrap">
                {(['All', 'Tech', 'Design', 'Business'] as CategoryType[]).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-slate-500 text-white shadow-lg'
                        : 'bg-white/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: 'upcoming' as TabType, label: 'Discover', count: filteredEvents.length },
            { id: 'saved' as TabType, label: 'My Calendar', count: savedEvents.size },
            { id: 'past' as TabType, label: 'Past Events', count: pastEvents.size },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                selectedTab === tab.id
                  ? 'text-slate-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                  {tab.count}
                </span>
              )}
              {selectedTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-600">
              {selectedTab === 'saved'
                ? "You haven't saved any events yet. Start exploring and save events you're interested in!"
                : selectedTab === 'past'
                ? "You haven't marked any events as attended yet."
                : 'Try adjusting your search or category filters to find more events.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventScout;
