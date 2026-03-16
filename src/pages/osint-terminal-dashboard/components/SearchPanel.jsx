import React, { useRef } from "react";
import Icon from "components/AppIcon";
import Button from "components/ui/Button";
import ModeSelectorTabs, { MODES } from "components/ui/ModeSelectorTabs";
import ProgressIndicatorSystem from "components/ui/ProgressIndicatorSystem";

const SearchPanel = ({
  activeMode,
  onModeChange,
  inputValue,
  onInputChange,
  onExecuteScan,
  isScanning,
  scanProgress,
  currentStage,
  elapsedTime,
  onCancel,
  isScanComplete,
  validationError,
}) => {
  const inputRef = useRef(null);
  const currentModeConfig = MODES?.find((m) => m?.value === activeMode);

  const handleKeyDown = (e) => {
    if (e?.key === "Enter" && !isScanning && inputValue?.trim()) {
      onExecuteScan();
    }
  };

  return (
    <div className="card-terminal mb-6">
      {/* Mode tabs */}
      <div className="mb-5">
        <ModeSelectorTabs activeMode={activeMode} onModeChange={onModeChange} />
      </div>
      {/* Terminal input */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-share-tech text-xs text-secondary tracking-widest">
            root@osint:~$
          </span>
          <span className="font-jetbrains text-xs text-muted-foreground opacity-60">
            {currentModeConfig?.description}
          </span>
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-primary font-share-tech text-sm select-none pointer-events-none">
            &gt;_
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e?.target?.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentModeConfig?.placeholder || "Enter target..."}
            disabled={isScanning}
            className="input-terminal pl-10 pr-4"
            aria-label={`Target ${activeMode} input`}
          />
          {inputValue && (
            <button
              onClick={() => onInputChange("")}
              className="absolute right-3 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Clear input"
            >
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
        {validationError && (
          <p className="font-jetbrains text-xs text-destructive mt-1.5 flex items-center gap-1">
            <Icon name="AlertTriangle" size={12} color="var(--color-destructive)" />
            {validationError}
          </p>
        )}
      </div>
      {/* Execute button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button
          variant="default"
          size="lg"
          onClick={onExecuteScan}
          disabled={isScanning || !inputValue?.trim()}
          loading={isScanning}
          iconName={isScanning ? "Loader" : "Zap"}
          iconPosition="left"
          iconSize={16}
          className="btn-press"
        >
          {isScanning ? "SCANNING..." : "EXECUTE SCAN"}
        </Button>
        {!isScanning && !isScanComplete && (
          <span className="font-jetbrains text-xs text-muted-foreground opacity-50">
            Press ENTER to execute
          </span>
        )}
      </div>
      {/* Progress */}
      {(isScanning || isScanComplete) && (
        <div className="mt-5 pt-4 border-t border-border border-opacity-30">
          <ProgressIndicatorSystem
            isActive={isScanning}
            isComplete={isScanComplete}
            currentStage={currentStage}
            progress={scanProgress}
            elapsedTime={elapsedTime}
            onCancel={onCancel}
          />
        </div>
      )}
    </div>
  );
};

export default SearchPanel;