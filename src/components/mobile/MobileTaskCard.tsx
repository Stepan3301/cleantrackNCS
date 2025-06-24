import React from 'react';
import { Task } from '@/types/database.types';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

interface MobileTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  showAssignee?: boolean;
}

export const MobileTaskCard: React.FC<MobileTaskCardProps> = ({
  task,
  onTaskClick,
  showAssignee = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`mobile-card border-l-4 border-l-gray-300 cursor-pointer`}
      onClick={() => onTaskClick(task)}
    >
      <div className="mobile-card-header">
        <div>
          <h3 className="mobile-card-title">{task.title}</h3>
          <p className="mobile-card-subtitle">{task.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mobile-card-content">
        {task.location && (
          <div className="mobile-card-row">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="mobile-card-label">Location</span>
            </div>
            <span className="mobile-card-value">{task.location}</span>
          </div>
        )}

        {task.time_start && task.time_end && (
          <div className="mobile-card-row">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="mobile-card-label">Time</span>
            </div>
            <span className="mobile-card-value">{task.time_start} - {task.time_end}</span>
          </div>
        )}

        {task.date && (
          <div className="mobile-card-row">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="mobile-card-label">Due Date</span>
            </div>
            <span className="mobile-card-value">
              {new Date(task.date).toLocaleDateString()}
            </span>
          </div>
        )}

        {showAssignee && task.assigned_staff && (
          <div className="mobile-card-row">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="mobile-card-label">Assignees</span>
            </div>
            <span className="mobile-card-value">{task.assigned_staff.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 