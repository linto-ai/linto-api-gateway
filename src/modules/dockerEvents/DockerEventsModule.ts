import Docker from "dockerode";
import Config from "@src/config";
import type { IModule } from "@src/core/IModule";
import type CoreGateway from "@src/core/CoreGateway";
import type { IEventBus } from "../coreEvents/IEventBus";

import { getCore } from "@src/core/CoreGateway";

export interface DockerEvent {
  status?: string; // ex: 'create'
  id: string; // ex: container/service id
  from?: string; // ex: image name
  Type: string; // ex: 'container', 'service', etc.
  Action: string; // ex: 'create', 'update', 'remove', etc.
  Actor: {
    ID: string;
    Attributes: Record<string, string>;
  };
  scope: string; // ex: 'local'
  time: number; // epoch seconds
  timeNano: number; // epoch nanoseconds
}

export interface DockerServiceInspect {
  [key: string]: any;
}

/**
 * DockerEventsModule
 * Listen to Docker events and dispatch them using coreEvents
 */
export default class DockerEventsModule implements IModule {
  public name = "docker-events";
  private docker: Docker;
  private bus: IEventBus | undefined;
  private listening = false;

  constructor() {
    this.docker = new Docker({
      socketPath: Config.getInstance().dockerSocketPath,
    });
  }

  /**
   * Initialize the module
   * @param core - The core gateway instance
   */
  async init(core: CoreGateway) {
    // Retrieve the coreEvents bus
    const coreEvents = core.modules.get<IModule & { bus: IEventBus }>(
      "core-events"
    );
    if (!coreEvents) throw new Error("core-events module not found");
    this.bus = coreEvents.bus;
    this.listenToDockerEvents();
  }

  /**
   * Get the Docker service
   * @returns The Docker service
   */
  getDockerService() {
    return this.docker;
  }

  /**
   * Get the Docker service by id
   * @param id - The id of the service (Actor.ID)
   * @returns The Docker service
   */
  getDockerServiceById(id: string) {
    return this.docker.getService(id);
  }

  /**
   * Get the Docker service details (inspect)
   * @param id - The id of the service (Actor.ID)
   * @returns The Docker service details
   */
  getDockerServiceDetails(id: string) {
    try {
      const service = this.docker.getService(id);
      if (!service) return null;
      return service.inspect();
    } catch (e) {
      getCore().log("error", "Error getting Docker service details:", e);
      return null;
    }
  }

  /**
   * Listen to Docker events
   *
   * @description This method listens to Docker events and dispatches them using the coreEvents bus.
   * It listens to all events and dispatches them using the coreEvents bus.
   *
   * @example
   * ```ts
   * this.bus?.emit('docker.event', event);
   * this.bus?.emit('docker.event.create', event);
   * this.bus?.emit('docker.event.update', event);
   * this.bus?.emit('docker.event.destroy', event);
   * this.bus?.emit('docker.event.start', event);
   * this.bus?.emit('docker.event.stop', event);
   * this.bus?.emit('docker.event.die', event);
   * this.bus?.emit('docker.event.kill', event);
   * this.bus?.emit('docker.event.pause', event);
   * this.bus?.emit('docker.event.unpause', event);
   * this.bus?.emit('docker.event.remove', event);
   * ```
   */
  private listenToDockerEvents() {
    if (this.listening) return;
    this.listening = true;
    this.docker.getEvents(
      {},
      (err: Error | null, stream: NodeJS.ReadableStream | undefined) => {
        if (err) {
          console.error("Error connecting to Docker events:", err);
          return;
        }
        if (!stream) return;
        stream.on("data", (chunk: Buffer) => {
          try {
            const event = JSON.parse(chunk.toString());
            if (event.Type !== "service") { // only listen to service events (not container events, yet see todo)
                return;
            }
            // Dispatch only create, update, destroy events
            if (
              [
                "create",
                "update",
                "destroy",
                "start",
                "stop",
                "die",
                "kill",
                "pause",
                "unpause",
                "remove",
              ].includes(event.Action)
            ) {
              this.bus?.emit("docker.event", event);
              this.bus?.emit(`docker.event.${event.Action}`, event);
            }
          } catch (e) {
            getCore().log("error", "Error parsing Docker event:", e);
            getCore().log("error", "Chunk:", chunk.toString());
          }
        });
      }
    );
  }
}
