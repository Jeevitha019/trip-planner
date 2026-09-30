import { useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, Check, Circle, Clock3, GripVertical, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext.jsx';

const activityCategories = ['Sightseeing', 'Food & drink', 'Stay', 'Transport', 'Experience'];

function ActivityForm({ activity, onSubmit, onCancel }) {
  const [title, setTitle] = useState(activity?.title ?? '');
  const [time, setTime] = useState(activity?.time ?? '');
  const [category, setCategory] = useState(activity?.category ?? activityCategories[0]);
  const [notes, setNotes] = useState(activity?.notes ?? '');

  function submit(event) {
    event.preventDefault();
    onSubmit({ title: title.trim(), time, category, notes: notes.trim() });
  }

  return <form className="activity-form" onSubmit={submit}><label>Activity<input required maxLength="72" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What would you like to do?" autoFocus /></label><div className="activity-form-row"><label>Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>Type<select value={category} onChange={(event) => setCategory(event.target.value)}>{activityCategories.map((item) => <option key={item}>{item}</option>)}</select></label></div><label>Notes <span className="optional-label">OPTIONAL</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Reservation details, address..." /></label><div className="activity-form-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary">{activity ? 'Save activity' : 'Add to itinerary'}</button></div></form>;
}

function SortableActivity({ activity, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 };
  return <article ref={setNodeRef} style={style} className={`activity-item${activity.done ? ' activity-done' : ''}`}>
    <button className="drag-handle" type="button" aria-label={`Drag to reorder ${activity.title}`} {...attributes} {...listeners}><GripVertical size={17} /></button>
    <button className="activity-check" type="button" aria-label={activity.done ? `Mark ${activity.title} incomplete` : `Mark ${activity.title} complete`} aria-pressed={Boolean(activity.done)} onClick={() => onToggle(activity)}>{activity.done ? <Check size={14} /> : <Circle size={17} />}</button>
    <div className="activity-copy"><div className="activity-title-line"><h4>{activity.title}</h4><span className="activity-category">{activity.category}</span></div>{activity.notes && <p>{activity.notes}</p>}<div className="activity-meta">{activity.time && <span><Clock3 size={13} /> {activity.time}</span>}<span><CalendarDays size={13} /> Day plan</span></div></div>
    <div className="activity-actions"><button type="button" className="icon-button" aria-label={`Edit ${activity.title}`} onClick={() => onEdit(activity)}><Pencil size={15} /></button><button type="button" className="icon-button danger-icon" aria-label={`Delete ${activity.title}`} onClick={() => onDelete(activity)}><Trash2 size={15} /></button></div>
  </article>;
}

export default function ActivityBoard({ trip }) {
  const { dispatch, notify, createId } = usePlanner();
  const [editingActivity, setEditingActivity] = useState(null);
  const [adding, setAdding] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const activityItems = trip.activities ?? [];
  const activityIds = activityItems.map((activity) => activity.id);

  function saveActivity(values) {
    if (editingActivity) {
      dispatch({ type: 'UPDATE_ACTIVITY', tripId: trip.id, activityId: editingActivity.id, updates: values });
      notify('Itinerary activity updated.');
    } else {
      dispatch({ type: 'ADD_ACTIVITY', tripId: trip.id, activity: { ...values, id: createId(), done: false } });
      notify('Added to your itinerary.');
    }
    setEditingActivity(null);
    setAdding(false);
  }

  function toggleActivity(activity) {
    dispatch({ type: 'UPDATE_ACTIVITY', tripId: trip.id, activityId: activity.id, updates: { done: !activity.done } });
  }

  function deleteActivity(activity) {
    dispatch({ type: 'DELETE_ACTIVITY', tripId: trip.id, activityId: activity.id });
    notify('Activity removed from the itinerary.');
  }

  function finishDrag({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = activityItems.findIndex((activity) => activity.id === active.id);
    const newIndex = activityItems.findIndex((activity) => activity.id === over.id);
    dispatch({ type: 'REORDER_ACTIVITIES', tripId: trip.id, activities: arrayMove(activityItems, oldIndex, newIndex) });
  }

  return <section className="feature-panel itinerary-panel"><div className="feature-heading"><div><span className="eyebrow">MAKE THE DAYS YOURS</span><h2><MapPin size={19} /> Itinerary</h2><p>Little plans make a big trip.</p></div><button className="button button-outline button-small" type="button" onClick={() => { setEditingActivity(null); setAdding((value) => !value); }}><Plus size={15} /> Add activity</button></div>
    {adding && !editingActivity && <div className="activity-editor"><div className="editor-heading"><strong>New itinerary activity</strong><button type="button" className="icon-button" onClick={() => setAdding(false)} aria-label="Close activity form"><X size={16} /></button></div><ActivityForm onSubmit={saveActivity} onCancel={() => setAdding(false)} /></div>}
    {activityItems.length ? <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={finishDrag}><SortableContext items={activityIds} strategy={verticalListSortingStrategy}><div className="activity-list">{activityItems.map((activity) => <div key={activity.id}>{editingActivity?.id === activity.id ? <div className="activity-editor edit-activity-editor"><div className="editor-heading"><strong>Edit activity</strong><button type="button" className="icon-button" onClick={() => setEditingActivity(null)} aria-label="Close activity form"><X size={16} /></button></div><ActivityForm activity={editingActivity} onSubmit={saveActivity} onCancel={() => setEditingActivity(null)} /></div> : <SortableActivity activity={activity} onToggle={toggleActivity} onEdit={setEditingActivity} onDelete={deleteActivity} />}</div>)}</div></SortableContext></DndContext> : !adding && <div className="empty-inline activity-empty"><span className="empty-icon"><CalendarDays size={18} /></span><div><strong>A day with room to roam</strong><p>Add a first stop, meal or moment to remember.</p></div><button type="button" className="text-button" onClick={() => setAdding(true)}>Add the first plan <Plus size={14} /></button></div>}
    <div className="drag-hint"><GripVertical size={13} /> Drag plans to reorder your day</div>
  </section>;
}