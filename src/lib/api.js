import { supabase } from './supabase';

export const api = {
    // Clients
    async getClients() {
        const { data, error } = await supabase.from('clients').select('*').order('name');
        if (error) throw error;
        return data;
    },

    async createClient(client) {
        const { data, error } = await supabase.from('clients').insert([client]).select().single();
        if (error) throw error;
        return data;
    },

    async updateClient(id, updates) {
        const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async deleteClient(id) {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
    },

    // Tasks
    async getTasks() {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        // Convert snake_case back to camelCase for the frontend if needed,
        // or just return as-is and update frontend to use snake_case
        return data.map(task => ({
            ...task,
            clientId: task.client_id,
            dueDate: task.due_date,
            timeSpent: task.time_spent,
            estimatedMin: task.estimated_min,
            allowOverrun: task.allow_overrun,
            fileLinks: task.file_links,
            outputLinks: task.output_links
        }));
    },

    async createTask(task) {
        // Convert camelCase to snake_case
        const dbTask = {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            client_id: task.clientId,
            due_date: task.dueDate,
            time_spent: task.timeSpent,
            recurring: task.recurring,
            estimated_min: task.estimatedMin,
            allow_overrun: task.allowOverrun,
            file_links: task.fileLinks,
            output_links: task.outputLinks,
            user_id: task.userId // Assuming userId is passed
        };

        // Remove undefined values
        Object.keys(dbTask).forEach(key => dbTask[key] === undefined && delete dbTask[key]);

        const { data, error } = await supabase.from('tasks').insert([dbTask]).select().single();
        if (error) throw error;

        return {
            ...data,
            clientId: data.client_id,
            dueDate: data.due_date,
            timeSpent: data.time_spent,
            estimatedMin: data.estimated_min,
            allowOverrun: data.allow_overrun,
            fileLinks: data.file_links,
            outputLinks: data.output_links
        };
    },

    async updateTask(id, updates) {
        const dbUpdates = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.timeSpent !== undefined) dbUpdates.time_spent = updates.timeSpent;
        if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
        if (updates.estimatedMin !== undefined) dbUpdates.estimated_min = updates.estimatedMin;
        if (updates.allowOverrun !== undefined) dbUpdates.allow_overrun = updates.allowOverrun;
        if (updates.fileLinks !== undefined) dbUpdates.file_links = updates.fileLinks;
        if (updates.outputLinks !== undefined) dbUpdates.output_links = updates.outputLinks;

        const { data, error } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;

        return {
            ...data,
            clientId: data.client_id,
            dueDate: data.due_date,
            timeSpent: data.time_spent,
            estimatedMin: data.estimated_min,
            allowOverrun: data.allow_overrun,
            fileLinks: data.file_links,
            outputLinks: data.output_links
        };
    },

    async deleteTask(id) {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    },

    // Time Entries
    async getTimeEntries() {
        const { data, error } = await supabase.from('time_entries').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        return data.map(entry => ({
            ...entry,
            taskId: entry.task_id,
            clientId: entry.client_id
        }));
    },

    async createTimeEntry(entry) {
        const dbEntry = {
            task_id: entry.taskId,
            client_id: entry.clientId,
            duration: entry.duration,
            date: entry.date,
            billable: entry.billable,
            description: entry.description,
            user_id: entry.userId
        };

        const { data, error } = await supabase.from('time_entries').insert([dbEntry]).select().single();
        if (error) throw error;

        return {
            ...data,
            taskId: data.task_id,
            clientId: data.client_id
        };
    },

    async deleteTimeEntry(id) {
        const { error } = await supabase.from('time_entries').delete().eq('id', id);
        if (error) throw error;
    }
};
