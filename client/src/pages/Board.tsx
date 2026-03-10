import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useTasks, useUpdateTask, useGenerateTask } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/kanban/TaskCard";
import { TaskDetailsModal } from "@/components/kanban/TaskDetailsModal";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutList, Loader2 } from "lucide-react";

const COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "in_progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];

export default function Board() {
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const generateTask = useGenerateTask();

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistically move task
    updateTask.mutate({ 
      id: parseInt(draggableId), 
      status: destination.droppableId 
    });
  };

  const handleGenerate = () => {
    generateTask.mutate({});
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading board...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background relative z-0">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1 h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Engineering Tasks</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Simulated sprint board. Generate realistic tasks and track progress.
            </p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={generateTask.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all rounded-xl h-11 px-6 group"
          >
            {generateTask.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            )}
            {generateTask.isPending ? "Generating..." : "Generate AI Task"}
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 h-full items-start min-w-max px-1">
              {COLUMNS.map(column => {
                const columnTasks = tasks.filter(t => t.status === column.id);
                
                return (
                  <div key={column.id} className="w-80 flex flex-col h-full max-h-full">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                        <LayoutList className="w-4 h-4 text-muted-foreground" />
                        {column.title}
                      </h3>
                      <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`
                            flex-1 p-3 rounded-2xl border transition-colors min-h-[150px] overflow-y-auto
                            ${snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20' : 'bg-secondary/30 border-transparent'}
                          `}
                        >
                          {columnTasks.map((task, index) => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              index={index} 
                              onClick={setSelectedTask} 
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      <TaskDetailsModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
}
