import { ROOM_CONFIGS } from './Step3RoomConfigs';
import { Step3RoomCard } from './Step3RoomCard';

type Step3PlanRoomsSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step3PlanRoomsSection({
    answers,
    onAnswerChange,
    isDisabled = false,
}: Step3PlanRoomsSectionProps): React.JSX.Element {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
            {ROOM_CONFIGS.map((room) => (
                <Step3RoomCard
                    key={room.id}
                    room={room}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={isDisabled}
                />
            ))}
        </div>
    );
}
