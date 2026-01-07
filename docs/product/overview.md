# Project Overview

## Introduction

This is a comprehensive **task and project management application** designed for teams to organize, track, and collaborate on work. Built with modern web technologies, it provides a robust foundation for managing projects and tasks with features like time tracking, notifications, reporting, and flexible filtering.

## Key Features

### Core Functionality

- **Project Management**: Create and manage projects with metadata, codes, descriptions, and status tracking
- **Task Management**: Comprehensive task system with assignees, status workflows, priorities, deadlines, tags, and rich descriptions
- **Time Tracking**: Built-in time tracking with estimates and actual time spent
- **Comments & Collaboration**: Task-level comments for team communication
- **Notifications**: In-app notification system for task assignments, updates, and comments
- **User Management**: Role-based access control (Admin, Manager, Supervisor, Employee)
- **Groups**: Organize users into groups for better collaboration

### Views & Navigation

- **Task Lists**: Rich filtering by status, assignee, project, tags, and date ranges
- **Saved Filters**: Save and reuse common filter combinations (e.g., "My tasks", "Overdue")
- **Project Overview**: Detailed project pages with task summaries and member information
- **Calendar View**: Visual calendar showing tasks by due date
- **Timesheet**: Weekly time tracking view with export capabilities
- **Reports**: Analytics and reporting for task completion, time spent, and team productivity

## Technical Architecture

### Backend

- **Convex**: Fully-managed backend platform providing:
  - Automatic schema generation and type safety
  - Real-time data synchronization
  - Built-in authentication via `@convex-dev/auth`
  - Serverless functions (queries, mutations, actions)
  - Automatic scaling and infrastructure management

### Frontend

- **React 19**: Modern React with hooks and functional components
- **TypeScript**: Full type safety with auto-generated Convex types
- **Vite**: Fast build tooling and development server
- **TanStack Query**: Efficient data fetching and caching with Convex
- **React Router**: Client-side routing
- **Zustand**: Lightweight state management with persistence
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling

## Target Users

- **Small to Medium Teams**: 5-100 person teams looking for a self-hosted task management solution
- **Startups**: Teams needing a flexible, customizable Anjam platform without SaaS limitations
- **Enterprise**: Organizations requiring on-premise deployment and full data control

## Key Benefits

- **Cloud-Hosted Backend**: Convex Cloud provides automatic scaling and infrastructure management
- **Easy Deployment**: Simple deployment with Convex CLI
- **Extensible**: Customizable through Convex schema and serverless functions
- **Type-Safe**: End-to-end TypeScript type safety with auto-generated types
- **Real-Time**: Automatic real-time data synchronization
- **Modern UX**: Fast, responsive interface with dark mode support

## Getting Started

See the [README](../README.md) for installation and quick start instructions, or refer to the [Development Guide](./DEVELOPMENT_GUIDE.md) for detailed technical information.

## Related Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical guidance for developers
- [Development Roadmap](./DEVELOPMENT_ROADMAP.md) - Strategic planning and future features
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current state of the application
- [QA Testing Guide](./QA_TESTING_GUIDE_SLIM.md) - Testing procedures and guidelines
- [Improvements Plan](./IMPROVEMENTS_PLAN.md) - Refactoring and improvement roadmap
