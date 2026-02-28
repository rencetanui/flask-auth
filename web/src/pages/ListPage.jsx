import { useParams } from "react-router-dom";
import TasksPage from "../components/tasks/TasksPage";

export default function ListPage() {
  const { id } = useParams();
  const listId = Number(id);

  return (
    <TasksPage
      title={`List #${id}`}
      show="active"
      view={`list:${id}`}
      defaultListId={Number.isFinite(listId) ? listId : null}
    />
  );
}